'use strict';

const fs = require('fs');

const renderReadme = require('./render');

const dataFilePath = `${__dirname}/../awesome-data.json`;
const readmeFilePath = `${__dirname}/../README.md`;

const requiredFields = ['name', 'github_link', 'github_user', 'web', 'technologies'];
const githubProfilePrefix = 'https://github.com/';

const errors = [];
const warnings = [];

function error(message) {
    errors.push(message);
}

function warn(message) {
    warnings.push(message);
}

// Lowercased and without a trailing slash, so "https://github.com/Foo/" and
// "https://github.com/foo" are treated as the same entry.
function normalize(value) {
    return String(value).trim().toLowerCase().replace(/\/+$/, '');
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

function isValidUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

function validateProfile(profile, label) {
    if (typeof profile !== 'object' || profile === null || Array.isArray(profile)) {
        error(`${label} must be an object`);
        return;
    }

    for (const field of requiredFields) {
        if (!(field in profile)) {
            error(`${label} is missing the "${field}" field`);
        }
    }

    if ('name' in profile && !isNonEmptyString(profile.name)) {
        error(`${label} has an empty "name"`);
    }

    if ('web' in profile) {
        if (!isNonEmptyString(profile.web)) {
            error(`${label} has an empty "web"`);
        } else if (!isValidUrl(profile.web)) {
            error(`${label} has an invalid "web" url: ${profile.web}`);
        }
    }

    // Seminars and other non-code entries legitimately have no github profile,
    // so an empty github_link is allowed -- a malformed one is not.
    if (isNonEmptyString(profile.github_link)) {
        if (!isValidUrl(profile.github_link)) {
            error(`${label} has an invalid "github_link" url: ${profile.github_link}`);
        } else if (!normalize(profile.github_link).startsWith(githubProfilePrefix)) {
            error(`${label} has a "github_link" that is not a github url: ${profile.github_link}`);
        } else if (isNonEmptyString(profile.github_user)) {
            const slug = normalize(profile.github_link).slice(githubProfilePrefix.length);
            if (slug !== normalize(profile.github_user)) {
                warn(`${label} has "github_user" (${profile.github_user}) that does not match "github_link" (${profile.github_link})`);
            }
        }
    }

    if ('technologies' in profile) {
        if (!Array.isArray(profile.technologies) || profile.technologies.length === 0) {
            error(`${label} must list at least one technology`);
        } else if (!profile.technologies.every(isNonEmptyString)) {
            error(`${label} has an empty entry in "technologies"`);
        }
    }
}

// `report` is either error or warn: a repeated github user or link means the
// same profile was added twice, but two developers can genuinely share a name,
// and an employee may list the same site as the company they work for.
function reportDuplicates(profiles, field, description, report) {
    const seen = new Map();

    for (const entry of profiles) {
        const value = entry.profile[field];

        if (!isNonEmptyString(value)) {
            continue;
        }

        const key = normalize(value);

        if (seen.has(key)) {
            report(`duplicate ${description} "${value}" in ${seen.get(key)} and ${entry.label}`);
        } else {
            seen.set(key, entry.label);
        }
    }
}

function validateData(data) {
    if (typeof data !== 'object' || data === null || !Array.isArray(data.awesome)) {
        error('awesome-data.json must contain an "awesome" array');
        return;
    }

    const allProfiles = [];

    data.awesome.forEach((section, sectionIndex) => {
        const sectionLabel = `awesome[${sectionIndex}]`;

        if (!isNonEmptyString(section.type)) {
            error(`${sectionLabel} is missing a "type"`);
        }

        if (!Array.isArray(section.profiles)) {
            error(`${sectionLabel} is missing a "profiles" array`);
            return;
        }

        section.profiles.forEach((profile, profileIndex) => {
            const name = profile && profile.name ? ` (${profile.name})` : '';
            const label = `${section.type || sectionLabel}[${profileIndex}]${name}`;

            validateProfile(profile, label);

            // Only usable entries take part in the duplicate scan, anything
            // else was already reported by validateProfile.
            if (typeof profile === 'object' && profile !== null && !Array.isArray(profile)) {
                allProfiles.push({ profile, label });
            }
        });
    });

    reportDuplicates(allProfiles, 'github_user', 'github user', error);
    reportDuplicates(allProfiles, 'github_link', 'github link', error);
    reportDuplicates(allProfiles, 'name', 'name', warn);
    reportDuplicates(allProfiles, 'web', 'website', warn);
}

// README.md is generated from awesome-data.json, so a checked in readme that
// differs from a fresh render means someone forgot to run `npm run build`.
function validateReadmeIsUpToDate(data) {
    if (!fs.existsSync(readmeFilePath)) {
        error('README.md is missing, run `npm run build` to generate it');
        return;
    }

    const committed = fs.readFileSync(readmeFilePath, 'utf8');

    if (committed !== renderReadme(data)) {
        error('README.md is out of date with awesome-data.json, run `npm run build` and commit the result');
    }
}

let data;

try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (e) {
    console.error(`awesome-data.json is not valid json: ${e.message}`);
    process.exit(1);
}

validateData(data);

if (errors.length === 0) {
    validateReadmeIsUpToDate(data);
}

for (const warning of warnings) {
    console.warn(`warning: ${warning}`);
}

if (errors.length > 0) {
    for (const message of errors) {
        console.error(`error: ${message}`);
    }

    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
}

console.log(`awesome-data.json is valid and README.md is up to date (${warnings.length} warning(s)).`);
