'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const siteSourceDirectory = path.join(__dirname, 'site');
const repositoryDirectory = path.join(__dirname, '..');

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function jsonForHtml(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function xmlEscape(value) {
    return value.replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
    }[character]));
}

function profileSlug(profile) {
    return slugify(profile.github_user || profile.name);
}

function profileUrl(metadata, profile) {
    return `${metadata.canonical_url}profiles/${profileSlug(profile)}/`;
}

function readSiteSource(filename) {
    return fs.readFileSync(path.join(siteSourceDirectory, filename), 'utf8');
}

function removeTrailingWhitespace(value) {
    return value.replace(/[ \t]+$/gm, '');
}

function buildSiteFiles(data) {
    const files = new Map();
    const profiles = data.awesome.flatMap((section) => section.profiles.map((profile) => ({
        ...profile,
        section: section.type,
        slug: profileSlug(profile),
        profile_url: profileUrl(data.metadata, profile)
    })));
    const counts = {
        total: profiles.length,
        developers: data.awesome[0].profiles.length,
        organizations: data.awesome[1].profiles.length,
        communities: data.awesome.slice(2).reduce((total, section) => total + section.profiles.length, 0)
    };
    const datasetJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'Awesome Pakistan',
                alternateName: 'Pakistani Open-Source Directory',
                url: data.metadata.canonical_url
            },
            {
                '@type': 'Dataset',
                name: data.metadata.title,
                alternateName: 'Awesome Pakistan',
                description: data.metadata.description,
                url: data.metadata.canonical_url,
                sameAs: data.metadata.repository_url,
                dateModified: data.metadata.last_updated,
                isAccessibleForFree: true,
                license: `${data.metadata.repository_url}/blob/master/LICENSE`,
                keywords: [
                    'Pakistani open-source developers',
                    'Pakistan GitHub contributors',
                    'Pakistani software organizations',
                    'Pakistan technology community'
                ],
                creator: {
                    '@type': 'Person',
                    name: 'Muhammad Usman',
                    url: 'https://github.com/usman2x'
                },
                distribution: [
                    {
                        '@type': 'DataDownload',
                        encodingFormat: 'application/json',
                        contentUrl: `${data.metadata.canonical_url}data/awesome-pakistani.json`
                    },
                    {
                        '@type': 'DataDownload',
                        encodingFormat: 'application/schema+json',
                        contentUrl: `${data.metadata.canonical_url}awesome-data.schema.json`
                    }
                ]
            }
        ]
    };

    const indexTemplate = readSiteSource('index.ejs');
    const profileTemplate = readSiteSource('profile.ejs');
    const renderContext = {
        ...data,
        counts,
        profiles,
        slugify,
        jsonForHtml,
        profileUrl
    };

    files.set('index.html', ejs.render(indexTemplate, {
        ...renderContext,
        jsonLd: datasetJsonLd
    }));

    for (const profile of profiles) {
        const isPerson = profile.section === 'Pakistani Open-Source Developers';
        const sameAs = [profile.github_link, profile.web].filter(Boolean);
        const profileJsonLd = {
            '@context': 'https://schema.org',
            '@type': isPerson ? 'Person' : 'Organization',
            name: profile.name,
            url: profile.profile_url,
            sameAs,
            knowsAbout: profile.technologies
        };

        files.set(`profiles/${profile.slug}/index.html`, ejs.render(profileTemplate, {
            ...renderContext,
            profile,
            isPerson,
            jsonLd: profileJsonLd
        }));
    }

    const sitemapUrls = [data.metadata.canonical_url, ...profiles.map((profile) => profile.profile_url)];
    files.set('sitemap.xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapUrls.map((url) => [
            '  <url>',
            `    <loc>${xmlEscape(url)}</loc>`,
            `    <lastmod>${data.metadata.last_updated}</lastmod>`,
            '  </url>'
        ].join('\n')),
        '</urlset>',
        ''
    ].join('\n'));
    files.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${data.metadata.canonical_url}sitemap.xml\n`);
    files.set('llms.txt', [
        `# ${data.metadata.title}`,
        '',
        data.metadata.description,
        '',
        `- Canonical directory: ${data.metadata.canonical_url}`,
        `- Source repository: ${data.metadata.repository_url}`,
        `- JSON dataset: ${data.metadata.canonical_url}data/awesome-pakistani.json`,
        `- JSON Schema: ${data.metadata.canonical_url}awesome-data.schema.json`,
        `- Citation metadata: ${data.metadata.repository_url}/blob/master/CITATION.cff`,
        `- Last updated: ${data.metadata.last_updated}`,
        ''
    ].join('\n'));
    files.set('data/awesome-pakistani.json', `${JSON.stringify(data, null, 2)}\n`);
    files.set('awesome-data.schema.json', fs.readFileSync(path.join(repositoryDirectory, 'awesome-data.schema.json'), 'utf8'));
    files.set('assets/styles.css', readSiteSource('styles.css'));
    files.set('assets/app.js', readSiteSource('app.js'));
    files.set('.nojekyll', '');

    return new Map([...files].map(([relativePath, content]) => [
        relativePath,
        removeTrailingWhitespace(content)
    ]));
}

module.exports = { buildSiteFiles };
