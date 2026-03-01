const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createPDF() {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
        const outputPath = path.join(__dirname, 'Schenectady_Heritage_RFP_Details.pdf');
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const imgDir = path.join(__dirname, 'images', 'fuck');
        const gold = '#c8962e';
        const dark = '#1a1a1a';
        const gray = '#555555';
        const lightBg = '#f7f5f0';
        const W = doc.page.width;
        const M = 50; // margin
        const contentW = W - M * 2;

        // Helper: Draw a horizontal rule
        const hr = (y, color = '#cccccc') => {
            doc.moveTo(M, y).lineTo(W - M, y).strokeColor(color).lineWidth(0.5).stroke();
        };

        // Helper: Section title
        const sectionTitle = (text, icon = '') => {
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(13).fillColor(gold).text(icon + text.toUpperCase(), M);
            const y = doc.y + 2;
            hr(y, gold);
            doc.moveDown(0.8);
        };

        // ============================================
        // PAGE 1: COVER PAGE
        // ============================================
        // Gold top bar
        doc.rect(0, 0, W, 8).fill(gold);

        doc.moveDown(5);

        doc.font('Helvetica').fontSize(12).fillColor(gray).text('NY CAPITAL FLIPPERS LLC', M, doc.y, { align: 'center' });
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(28).fillColor(dark).text('REQUEST FOR PROPOSAL', { align: 'center' });
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(22).fillColor(gold).text('Schenectady Heritage Property', { align: 'center' });
        doc.font('Helvetica').fontSize(14).fillColor(gray).text('Full Gut Renovation — Residential', { align: 'center' });

        doc.moveDown(3);

        // Key Facts Box
        doc.rect(M + 40, doc.y, contentW - 80, 120).fill(lightBg);
        const boxY = doc.y + 15;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(dark);
        doc.text('Project Budget:', M + 60, boxY);
        doc.font('Helvetica').fillColor(gold).text('$150,000 (Cash Disbursement)', M + 180, boxY);
        doc.font('Helvetica-Bold').fillColor(dark).text('Location:', M + 60, boxY + 22);
        doc.font('Helvetica').fillColor(gray).text('Schenectady, NY 12302', M + 180, boxY + 22);
        doc.font('Helvetica-Bold').fillColor(dark).text('Project Type:', M + 60, boxY + 44);
        doc.font('Helvetica').fillColor(gray).text('Residential Full Gut Restoration', M + 180, boxY + 44);
        doc.font('Helvetica-Bold').fillColor(dark).text('Timeline:', M + 60, boxY + 66);
        doc.font('Helvetica').fillColor(gray).text('60 Calendar Days from Notice to Proceed', M + 180, boxY + 66);
        doc.font('Helvetica-Bold').fillColor(dark).text('Bid Deadline:', M + 60, boxY + 88);
        doc.font('Helvetica').fillColor('#cc0000').text('Rolling Basis — Immediate Review', M + 180, boxY + 88);

        doc.y = boxY + 130;
        doc.moveDown(3);

        // Confidentiality notice
        doc.font('Helvetica').fontSize(8).fillColor('#999999').text('CONFIDENTIAL — This document contains proprietary project information intended solely for qualified contractors under consideration. Unauthorized reproduction or distribution is prohibited.', M + 20, doc.y, { align: 'center', width: contentW - 40 });

        // Gold bottom bar
        doc.rect(0, doc.page.height - 8, W, 8).fill(gold);

        // ============================================
        // PAGE 2: PROJECT OVERVIEW
        // ============================================
        doc.addPage();
        doc.rect(0, 0, W, 4).fill(gold);

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(dark).text('1. PROJECT OVERVIEW', M);
        doc.moveDown(0.3);
        hr(doc.y, gold);
        doc.moveDown(0.8);

        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'NY Capital Flippers LLC ("Owner") has recently acquired a distressed heritage residential property located in Schenectady, New York. The property has been vacant for an extended period and requires a comprehensive, code-compliant full gut renovation to restore it to modern residential standards suitable for the regional rental or resale market.',
            M, doc.y, { width: contentW, lineGap: 4 }
        );
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'This Request for Proposal (RFP) is issued to solicit competitive bids from licensed, insured, and qualified general contractors or construction firms with demonstrated experience in residential rehabilitation projects within the Capital Region of New York State.',
            M, doc.y, { width: contentW, lineGap: 4 }
        );

        sectionTitle('1.1 Property Details');
        const details = [
            ['Address:', '1234 Heritage Avenue, Schenectady, NY 12302'],
            ['Property Type:', 'Single-Family Residential (2-Story + Basement)'],
            ['Approx. Square Footage:', '2,400 sq ft (Living) / 800 sq ft (Basement)'],
            ['Lot Size:', '0.18 Acres'],
            ['Year Built:', 'c. 1945 (estimated)'],
            ['Current Condition:', 'Vacant — significant deferred maintenance; structurally sound per preliminary inspection'],
            ['Zoning:', 'R-1 Residential (Single-Family)'],
            ['Utilities:', 'Municipal water/sewer; natural gas; electric (National Grid service area)'],
        ];
        details.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor(dark).text(label, M + 10, doc.y, { continued: true, width: 160 });
            doc.font('Helvetica').fillColor(gray).text('  ' + value, { width: contentW - 180 });
            doc.moveDown(0.15);
        });

        sectionTitle('1.2 Budget & Payment Structure');
        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'The total project budget is $150,000.00 (One Hundred Fifty Thousand Dollars), funded entirely through cash reserves held by the Owner. Payments will be structured on a milestone basis as follows:',
            M, doc.y, { width: contentW, lineGap: 4 }
        );
        doc.moveDown(0.5);
        const payments = [
            ['Milestone 1 — Mobilization & Demo:', '$22,500', '15%', 'Upon signed contract and site mobilization'],
            ['Milestone 2 — Structural & Framing:', '$30,000', '20%', 'Completion of structural/framing work'],
            ['Milestone 3 — MEP Rough-In:', '$37,500', '25%', 'Rough plumbing, electrical, HVAC inspection passed'],
            ['Milestone 4 — Interior Finishes:', '$37,500', '25%', 'Drywall, flooring, cabinetry, fixtures'],
            ['Milestone 5 — Final Punch & CO:', '$22,500', '15%', 'Certificate of Occupancy and final walkthrough'],
        ];
        payments.forEach(([name, amount, pct, desc]) => {
            doc.font('Helvetica-Bold').fontSize(9).fillColor(dark).text(name, M + 10, doc.y, { width: contentW });
            doc.font('Helvetica').fontSize(9).fillColor(gray).text(`${amount} (${pct}) — ${desc}`, M + 20, doc.y, { width: contentW - 30 });
            doc.moveDown(0.3);
        });

        // ============================================
        // PAGE 3: SCOPE OF WORK
        // ============================================
        doc.addPage();
        doc.rect(0, 0, W, 4).fill(gold);

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(dark).text('2. SCOPE OF WORK', M);
        doc.moveDown(0.3);
        hr(doc.y, gold);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'The selected Contractor shall provide all labor, materials, equipment, and supervision necessary to complete the following scope of work in accordance with all applicable local, state, and federal codes:',
            M, doc.y, { width: contentW, lineGap: 4 }
        );
        doc.moveDown(0.5);

        const scopes = [
            { title: 'A. Demolition & Site Prep', items: ['Complete interior demolition to studs (all rooms, kitchen, bathrooms)', 'Removal of all existing flooring, cabinetry, fixtures, and appliances', 'Debris removal and proper disposal (roll-off dumpsters)', 'Hazardous material abatement (if asbestos/lead paint identified)'] },
            { title: 'B. Structural & Framing', items: ['Foundation crack repair and waterproofing', 'Basement slab leveling and moisture barrier installation', 'Floor joist reinforcement or sister joisting as needed', 'Window and door rough opening modifications per new floor plan'] },
            { title: 'C. Mechanical, Electrical, Plumbing (MEP)', items: ['Complete electrical rewiring — 200-amp panel upgrade', 'New forced-air HVAC system with high-efficiency furnace', 'Full re-plumbing with PEX supply lines and PVC drain/waste', 'Hot water heater installation (tankless or 50-gal tank)'] },
            { title: 'D. Interior Build-Out', items: ['New drywall throughout (fire-rated where required)', 'LVP flooring in living areas; ceramic tile in baths and kitchen', 'Kitchen: 30 LF of modular cabinetry, laminate countertops, standard appliance package', 'Bathrooms (×2): tub/shower combo, vanity, toilet, tile surround', 'Interior doors, trim, baseboards, and closet shelving'] },
            { title: 'E. Exterior Work', items: ['Vinyl siding repair/replacement (front and sides)', 'Roof inspection and repair (patch or partial re-shingle)', 'Exterior painting — trim, soffits, fascia', 'Gutters and downspouts — clean or replace', 'Concrete walkway and front step repair'] },
        ];

        scopes.forEach(scope => {
            doc.font('Helvetica-Bold').fontSize(10).fillColor(dark).text(scope.title, M + 5, doc.y);
            doc.moveDown(0.15);
            scope.items.forEach(item => {
                doc.font('Helvetica').fontSize(9).fillColor(gray).text('•  ' + item, M + 20, doc.y, { width: contentW - 30, lineGap: 2 });
                doc.moveDown(0.1);
            });
            doc.moveDown(0.4);
        });

        // ============================================
        // PAGE 4: SITE PHOTOGRAPHS
        // ============================================
        doc.addPage();
        doc.rect(0, 0, W, 4).fill(gold);

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(dark).text('3. EXISTING SITE PHOTOGRAPHS', M);
        doc.moveDown(0.3);
        hr(doc.y, gold);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'The following photographs document the current as-is condition of the property. These images are provided to assist contractors in preparing accurate bids. An on-site walkthrough can be scheduled upon request.',
            M, doc.y, { width: contentW, lineGap: 4 }
        );
        doc.moveDown(0.8);

        const photos = [
            { file: '1.PNG', caption: 'Exterior — Rear elevation showing existing siding and HVAC unit' },
            { file: '2.PNG', caption: 'Interior — Main living area with wood paneling (to be removed)' },
            { file: '3.PNG', caption: 'Interior — Kitchen area visible through window; drop ceiling and partition wall' },
        ];

        photos.forEach(photo => {
            const imgPath = path.join(imgDir, photo.file);
            if (fs.existsSync(imgPath)) {
                const imgY = doc.y;
                doc.image(imgPath, M, imgY, { fit: [contentW, 180], align: 'center' });
                doc.link(M, imgY, contentW, 180, 'https://nycapitalflippers.site/schenectady-heritage?ref=pdf');
                doc.y = imgY + 185;
                doc.font('Helvetica').fontSize(8).fillColor('#888888').text(photo.caption, M, doc.y, { align: 'center', width: contentW });
                doc.moveDown(1);
            }
        });

        // ============================================
        // PAGE 5: MORE PHOTOS
        // ============================================
        doc.addPage();
        doc.rect(0, 0, W, 4).fill(gold);

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(dark).text('3. SITE PHOTOGRAPHS (CONTINUED)', M);
        doc.moveDown(0.3);
        hr(doc.y, gold);
        doc.moveDown(0.8);

        const photos2 = [
            { file: '4.PNG', caption: 'Interior — Existing kitchen cabinetry and plumbing fixtures (to be demolished)' },
            { file: '5.PNG', caption: 'Interior — Secondary room with wood paneling and ceiling fan' },
            { file: '6.png', caption: 'Exterior — Backyard view showing lot depth and existing playground structure' },
        ];

        photos2.forEach(photo => {
            const imgPath = path.join(imgDir, photo.file);
            if (fs.existsSync(imgPath)) {
                const imgY = doc.y;
                doc.image(imgPath, M, imgY, { fit: [contentW, 180], align: 'center' });
                doc.link(M, imgY, contentW, 180, 'https://nycapitalflippers.site/schenectady-heritage?ref=pdf');
                doc.y = imgY + 185;
                doc.font('Helvetica').fontSize(8).fillColor('#888888').text(photo.caption, M, doc.y, { align: 'center', width: contentW });
                doc.moveDown(1);
            }
        });

        // ============================================
        // PAGE 6: CONTRACTOR REQUIREMENTS & TIMELINE
        // ============================================
        doc.addPage();
        doc.rect(0, 0, W, 4).fill(gold);

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(dark).text('4. CONTRACTOR REQUIREMENTS', M);
        doc.moveDown(0.3);
        hr(doc.y, gold);
        doc.moveDown(0.8);

        sectionTitle('4.1 Minimum Qualifications');
        const quals = [
            'Valid New York State Home Improvement Contractor registration',
            'General Liability Insurance: minimum $1,000,000 per occurrence',
            'Workers\' Compensation Insurance (current and verifiable)',
            'Minimum 3 years experience in residential gut renovation projects',
            'At least 2 verifiable project references in the Capital Region',
            'Capacity to maintain a full-time crew of 4+ workers on site',
        ];
        quals.forEach(q => {
            doc.font('Helvetica').fontSize(9.5).fillColor(gray).text('✓  ' + q, M + 10, doc.y, { width: contentW - 20, lineGap: 2 });
            doc.moveDown(0.2);
        });

        sectionTitle('4.2 Project Timeline');
        const timeline = [
            ['Phase 1 (Days 1–7):', 'Site securing, utility coordination, permits, interior demolition'],
            ['Phase 2 (Days 8–21):', 'Structural work, framing modifications, basement waterproofing'],
            ['Phase 3 (Days 22–35):', 'MEP rough-in, insulation, municipal inspections'],
            ['Phase 4 (Days 36–50):', 'Drywall, flooring, kitchen/bath installation, interior finishes'],
            ['Phase 5 (Days 51–60):', 'Final finishes, punch list, C/O application, owner walkthrough'],
        ];
        timeline.forEach(([phase, desc]) => {
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor(dark).text(phase, M + 10, doc.y, { continued: true, width: 160 });
            doc.font('Helvetica').fillColor(gray).text('  ' + desc, { width: contentW - 180 });
            doc.moveDown(0.2);
        });

        sectionTitle('4.3 Bid Submission Instructions');
        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'Interested contractors should submit their proposal via the secure online portal at:',
            M, doc.y, { width: contentW, lineGap: 4 }
        );
        doc.moveDown(0.5);

        // CTA Link
        doc.font('Helvetica-Bold').fontSize(11).fillColor(gold).text(
            'https://nycapitalflippers.site/schenectady-heritage',
            M + 20, doc.y, { link: 'https://nycapitalflippers.site/schenectady-heritage?ref=pdf_cta', underline: true }
        );
        doc.moveDown(0.8);

        doc.font('Helvetica').fontSize(10).fillColor(gray).text(
            'Your proposal should include:',
            M, doc.y, { width: contentW }
        );
        doc.moveDown(0.3);
        const includes = [
            'Company name, address, and primary contact information',
            'Proof of licensing, insurance, and bond (if applicable)',
            'Itemized cost breakdown by trade/scope category',
            'Proposed project schedule with key milestones',
            'At least two (2) references from similar completed projects',
            'Any exclusions or allowances assumed in the bid price',
        ];
        includes.forEach(item => {
            doc.font('Helvetica').fontSize(9.5).fillColor(gray).text('•  ' + item, M + 20, doc.y, { width: contentW - 30, lineGap: 2 });
            doc.moveDown(0.15);
        });

        doc.moveDown(2);

        // Footer
        hr(doc.y, '#cccccc');
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa').text(
            '© 2025 NY Capital Flippers LLC  |  41 State Street, Suite 802, Albany, NY 12207  |  bids@nycapflippers.com',
            M, doc.y, { align: 'center', width: contentW }
        );

        // Bottom bar on all pages
        doc.rect(0, doc.page.height - 4, W, 4).fill(gold);

        doc.end();

        stream.on('finish', () => {
            console.log('✅ PDF generated successfully:', outputPath);
            resolve(outputPath);
        });
        stream.on('error', (err) => {
            console.error('❌ Error generating PDF:', err);
            reject(err);
        });
    });
}

createPDF().then(() => process.exit(0)).catch(() => process.exit(1));
