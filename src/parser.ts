export function extractJMMHR(text: string, primaryColor: string): string {
    // Basic cleanup of starting CSS
    let t = text.replace(/@page\s*\{[^}]*}/g, '');
    t = t.replace(/[a-z0-9:.]+\s*\{[^}]*}/gi, '').trim();
    
    // Now we have the clean text. Let's find the anchors.
    const correspondenceIndex = t.indexOf('*Correspondence:');
    const citationIndex = t.indexOf('Citation:');
    const ackIndex = t.indexOf('Acknowledgement:');
    const receivedIndex = t.indexOf('Received:');
    const abstractIndex = t.indexOf('ABSTRACT:');
    const keywordsIndex = t.indexOf('Keywords:');
    const refRegex = /\nReferences\s*\n/i;
    const refMatch = t.match(refRegex);
    const referencesIndex = refMatch && refMatch.index !== undefined ? refMatch.index : -1;

    // Header part
    const headerPart = t.substring(0, correspondenceIndex > 0 ? correspondenceIndex : 0).trim();
    const headerLines = headerPart.split(/\n+/).map(l => l.trim()).filter(l => l);
    // Usually type is line 0, title is line 1, authors line 2, affiliations line 3+
    const type = headerLines[0] || 'EDITORIAL';
    const title = headerLines[1] || '';
    const authors = headerLines[2] || '';
    const affiliations = headerLines.slice(3).join('<br>');

    const correspondence = correspondenceIndex > 0 ? t.substring(correspondenceIndex, citationIndex).trim() : '';
    const citation = citationIndex > 0 ? t.substring(citationIndex, ackIndex).trim() : '';
    const metadata = ackIndex > 0 ? t.substring(ackIndex, receivedIndex).trim() : '';
    const dates = receivedIndex > 0 ? t.substring(receivedIndex, abstractIndex).trim() : '';
    const abstractText = abstractIndex > 0 ? t.substring(abstractIndex + 9, keywordsIndex).trim() : '';
    
    let bodyPart = '';
    let keywords = '';
    if (referencesIndex !== -1 && keywordsIndex !== -1) {
        keywords = t.substring(keywordsIndex, t.indexOf('\n', keywordsIndex)).trim();
        const bodyStart = keywordsIndex + keywords.length;
        bodyPart = t.substring(bodyStart, referencesIndex).trim();
    } else if (keywordsIndex !== -1) {
        // No references
        keywords = t.substring(keywordsIndex, t.indexOf('\n', keywordsIndex)).trim();
        bodyPart = t.substring(keywordsIndex + keywords.length).trim();
    }

    const referencesPart = referencesIndex !== -1 ? t.substring(referencesIndex + refMatch![0].length).trim() : '';

    // Further parsing
    // Correspondence might have email
    const emailMatch = correspondence.match(/\((.*?@.*?)\)/);
    let email = emailMatch ? emailMatch[1] : '';
    
    // Dates parsing
    let datesHtml = dates
        .replace(/Received:/g, '<strong>Received:</strong>')
        .replace(/Revised:/g, '; <strong>Revised:</strong>')
        .replace(/Accepted:/g, '; <strong>Accepted:</strong>')
        .replace(/Published:/g, '; <strong>Published:</strong>');
        
    // Metadata formatting
    const metaKeys = ['Acknowledgement', 'Competing Interests', 'Grant Support and Funding Source', 'Study Ethical Approval', 'Consent for Participation and Publication', 'Availability of Data and Materials', 'Use of Artificial Intelligence', 'Authors’ Contribution', 'Authors\' Contribution'];
    let metadataHtml = metadata;
    metaKeys.forEach(key => {
        metadataHtml = metadataHtml.replace(new RegExp(key + ':', 'g'), `<strong style="color: ${primaryColor}">${key}:</strong>`);
    });

    // Citation formatting
    const doiMatch = citation.match(/10\.\d+\/.*?(?=\s|$)/);
    const citationHtml = citation.replace('Citation:', '<strong>Citation:</strong>') + 
        (doiMatch ? ` <a href="https://doi.org/${doiMatch[0]}" target="_blank">https://doi.org/${doiMatch[0]}</a>` : ` <a href="https://doi.org/10.68041/jmmhr.v1i1/01" target="_blank">https://doi.org/10.68041/jmmhr.v1i1/01</a>`);

    // Body parsing
    const bodyParagraphs = bodyPart.split(/\n+/).map(p => p.trim()).filter(p => p);
    let bodyHtml = '';
    bodyParagraphs.forEach(p => {
        if (p.startsWith('Figure 1.')) {
            bodyHtml += `\n    <div style="border: 1px solid #ddd; padding: 15px; text-align: center; background-color: #fafafa; margin: 25px 0;">
        <img src="JMMHR-1-34920.png" alt="Framework for AI-Enabled Multidisciplinary Precision Medicine Research" style="max-width: 100%; height: auto;">
        <p style="font-size: 0.9em; color: #555; margin-top: 5px;"><strong>Figure 1.</strong> ${p.substring(9).trim()}</p>
    </div>\n`;
            return;
        }

        const colonMatch = p.match(/^([^:]+):\s+(.*)$/);
        if (colonMatch && colonMatch[1].length < 60) {
            bodyHtml += `    <h2>${colonMatch[1]}</h2>\n    <p>${colonMatch[2]}</p>\n`;
        } else {
            bodyHtml += `    <p>${p}</p>\n`;
        }
    });

    // References parsing
    let refHtml = '<ol style="padding-left: 20px; font-size: 0.9em; line-height: 1.7;">\n';
    const refs = referencesPart.split(/\n+/).map(r => r.trim()).filter(r => r);
    refs.forEach(r => {
        let cleanRef = r.replace(/^\d+\.\s*/, '');
        cleanRef = cleanRef.replace(/\[?(https?:\/\/[^\s\]]+)\]?/g, '<a href="$1" target="_blank">$1</a>');
        refHtml += `        <li style="margin-bottom: 10px;">${cleanRef}</li>\n`;
    });
    refHtml += '    </ol>\n';

    // Assemble HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JMMHR Editorial View</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .journal-header {
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #555;
        }
        h1 {
            color: ${primaryColor};
            font-size: 1.8em;
            line-height: 1.3;
        }
        .meta-box {
            background-color: #f8f9fa;
            border-left: 4px solid ${primaryColor};
            padding: 15px;
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        .abstract-box {
            background-color: #f1f7fe;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
        }
        .acknowledgement {
            color: ${primaryColor};
            font-size: 0.7em;
        }
        h2 {
            color: #333;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        a { color: ${primaryColor}; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>

    <div class="journal-header">
        <strong>Journal of Medical and Multidisciplinary Healthcare Research</strong>, 1(1): June, 2026
    </div>
    <h2 style="background-color: ${primaryColor}; color: white; display: inline-block; padding: 1px 2px; font-size: 1.5em; margin-top: 0;">${type}</h2>
    <h1>${title}</h1>
    
    <p><strong>${authors.replace(/\d+\*/g, '<sup>1*</sup>')}</strong></p>
    <p style="color: #666; font-size: 0.95em;">
        <sup>1</sup>${affiliations.replace(/^1/, '')}<br>
        *Correspondence: <a href="mailto:${email}" target="_blank">${email}</a>
    </p>

    <div class="meta-box">
        ${citationHtml}
    </div>

    <div style="font-size: 0.7em;">
        ${metadataHtml}
    </div>

    <p style="text-align: center; font-size: 0.9em;">
        ${datesHtml}
    </p>

    <div class="abstract-box">
        <h3 style="margin-top: 0; color: ${primaryColor};">ABSTRACT</h3>
        <p>${abstractText}</p>
        <p><strong>${keywords.replace('Keywords:', 'Keywords:</strong>')}</p>
    </div>

${bodyHtml}
    <h2>References</h2>
${refHtml}

    <div style="display: flex; align-items: flex-start; gap: 10px; margin-top: 50px;">
        <img src="Cc_by-nc_icon.png" alt="CC_BY-NC Icon" style="width: 90px; height: 60px;">
        <p style="margin: 0; font-size: 0.5em;">
            <span style="color: ${primaryColor}">Journal of Medical and Multidisciplinary Healthcare Research, J Med Multidiscip Healthc Res 2026:1(1), p1-3 (<a href="https://jmmhr.com" target="_blank">jmmhr.com</a>)</span>
            <span style="color: #555;">© 2026 Authors. This work is published by <a href="https://msarinstitute.org" target="_blank">Multidisciplinary Scholarly Advancement and Research MSAR Institute</a>. The full terms of Journal Publishing policy is available at <a href="https://jmmhr.org/index.php/jmmhr/journal-policies" target="_blank">https://jmmhr.org/index.php/jmmhr/journal-policies</a> and incorporate the Creative Commons Attribution – Non Commercial (CC BY, NC 4.0) License <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">https://creativecommons.org/licenses/by-nc/4.0/</a>. By accessing the work you hereby accept the Terms. Non-commercial uses of the work are permitted without any further permission, provided the work is properly attributed. Publisher’s Note: MSAR Institute remains neutral with regard to jurisdictional claims in published maps and institutional affiliations, and assumes no liability for the scientific accuracy or clinical efficacy of the content herein, as they rest entirely with the authors.</span>
        </p>
    </div>

</body>
</html>`;
}
