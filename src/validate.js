'use strict';

const fs = require('fs');

const renderReadme = require('./render');

const dataFilePath = `${__dirname}/../awesome-data.json`;
const readmeFilePath = `${__dirname}/../README.md`;
const requiredFields = ['name', 'github_link', 'github_user', 'web', 'technologies'];
const errors = [];

function addError(location, message) {
    errors.push(`${location}: ${message}`);
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalize(value) {
    return value.trim().toLowerCase().replace(/\/+$/, '');
}

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function validateProfile(profile, location) {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        addError(location, 'profile must be an object');
        return;
    }

    for (const field of requiredFields) {
        if (!(field in profile)) {
            addError(location, `missing required field "${field}"`);
        }
    }

    if (!isNonEmptyString(profile.name)) {
        addError(location, 'name must be a non-empty string');
    }

    if (!isNonEmptyString(profile.web) || !isHttpUrl(profile.web)) {
        addError(location, 'web must be a valid HTTP(S) URL');
    }

    const hasGithubLink = isNonEmptyString(profile.github_link);
    const hasGithubUser = isNonEmptyString(profile.github_user);

    if (hasGithubLink !== hasGithubUser) {
        addError(location, 'github_link and github_user must either both be set or both be empty');
    } else if (hasGithubLink) {
        let githubUrl;

        try {
            githubUrl = new URL(profile.github_link);
        } catch {
            addError(location, 'github_link must be a valid URL');
        }

        if (githubUrl) {
            const pathParts = githubUrl.pathname.split('/').filter(Boolean);

            if (githubUrl.protocol !== 'https:' || githubUrl.hostname !== 'github.com' || pathParts.length !== 1) {
                addError(location, 'github_link must point to a GitHub user or organization profile');
            } else if (normalize(pathParts[0]) !== normalize(profile.github_user)) {
                addError(location, 'github_user must match the handle in github_link');
            }
        }
    }

    if (!Array.isArray(profile.technologies) || profile.technologies.length === 0) {
        addError(location, 'technologies must be a non-empty array');
    } else {
        const normalizedTechnologies = new Set();

        profile.technologies.forEach((technology, index) => {
            if (!isNonEmptyString(technology)) {
                addError(`${location}.technologies[${index}]`, 'technology must be a non-empty string');
                return;
            }

            const normalized = normalize(technology);
            if (normalizedTechnologies.has(normalized)) {
                addError(location, `duplicate technology "${technology}"`);
            }
            normalizedTechnologies.add(normalized);
        });
    }
}

function validateData(data) {
    if (!data || !Array.isArray(data.awesome)) {
        addError('awesome-data.json', 'top-level "awesome" property must be an array');
        return;
    }

    const sectionNames = new Set();
    const githubUsers = new Map();
    const githubLinks = new Map();

    data.awesome.forEach((section, sectionIndex) => {
        const sectionLocation = `awesome[${sectionIndex}]`;

        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            addError(sectionLocation, 'section must be an object');
            return;
        }

        if (!isNonEmptyString(section.type)) {
            addError(sectionLocation, 'type must be a non-empty string');
        } else {
            const normalizedType = normalize(section.type);
            if (sectionNames.has(normalizedType)) {
                addError(sectionLocation, `duplicate section type "${section.type}"`);
            }
            sectionNames.add(normalizedType);
        }

        if (!Array.isArray(section.profiles)) {
            addError(sectionLocation, 'profiles must be an array');
            return;
        }

        section.profiles.forEach((profile, profileIndex) => {
            const location = `${section.type || sectionLocation}.profiles[${profileIndex}]`;
            validateProfile(profile, location);

            if (!profile || typeof profile !== 'object') {
                return;
            }

            for (const [field, seen] of [['github_user', githubUsers], ['github_link', githubLinks]]) {
                if (!isNonEmptyString(profile[field])) {
                    continue;
                }

                const normalized = normalize(profile[field]);
                if (seen.has(normalized)) {
                    addError(location, `duplicate ${field}; already used by ${seen.get(normalized)}`);
                } else {
                    seen.set(normalized, location);
                }
            }
        });
    });
}

let data;

try {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
    console.error(`awesome-data.json: invalid JSON: ${error.message}`);
    process.exit(1);
}

validateData(data);

if (fs.existsSync(readmeFilePath)) {
    const committedReadme = fs.readFileSync(readmeFilePath, 'utf8').replace(/\r\n/g, '\n');
    const generatedReadme = renderReadme(data).replace(/\r\n/g, '\n');

    if (committedReadme !== generatedReadme) {
        addError('README.md', 'out of date; run "npm run build" and commit the result');
    }
} else {
    addError('README.md', 'missing; run "npm run build"');
}

if (errors.length > 0) {
    errors.forEach((error) => console.error(`error: ${error}`));
    console.error(`\nValidation failed with ${errors.length} error(s).`);
    process.exit(1);
}

const profileCount = data.awesome.reduce((total, section) => total + section.profiles.length, 0);
console.log(`Validated ${profileCount} profiles and README.md is up to date.`);
