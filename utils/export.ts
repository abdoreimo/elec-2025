
import type { InstitutionInfo, Beneficiary, Compensation } from '../types';
import { calculateRIP, formatCurrency, numberToArabicText } from './calculations';

interface AppData {
    institutionInfo: InstitutionInfo;
    beneficiaries: Beneficiary[];
    compensations: Compensation[];
}

// Ensure SheetJS is loaded from CDN
declare const XLSX: any;

function getReportData(appData: AppData) {
    const { beneficiaries, compensations } = appData;
    const reportData = compensations.map(comp => {
        const beneficiary = beneficiaries.find(b => b.id === comp.beneficiaryId);
        if (!beneficiary) return null;
        return {
            id: beneficiary.id,
            name: beneficiary.name,
            meter: beneficiary.meter,
            rip: calculateRIP(beneficiary.account),
            q1: comp.q1.calculated,
            q2: comp.q2.calculated,
            q3: comp.q3.calculated,
            q4: comp.q4.calculated,
            discount: comp.discount || 0,
            netPayable: comp.netPayable
        };
    }).filter(Boolean).sort((a, b) => (a?.id || 0) - (b?.id || 0));
    
    // The non-null assertion operator (!) is used here because filter(Boolean) ensures no nulls.
    // However, to be safer with TypeScript, we can cast it.
    return reportData as NonNullable<typeof reportData[0]>[];
}


export function generateReportHTML(appData: AppData, forPrint: boolean): string {
    const { institutionInfo } = appData;
    const reportData = getReportData(appData);

    const totalBeneficiaries = reportData.length;
    const totalDiscount = reportData.reduce((sum, item) => sum + (item.discount || 0), 0);
    const totalNetPayable = reportData.reduce((sum, item) => sum + item.netPayable, 0);
    const totalNetPayableText = numberToArabicText(totalNetPayable);

    const tableRows = reportData.map(item => `
        <tr style="border-bottom: 1px solid #fde68a;">
            <td style="padding: 8px; text-align: right;">${item.id}</td>
            <td style="padding: 8px; text-align: right;">${item.name}</td>
            <td style="padding: 8px; text-align: right;">${item.meter}</td>
            <td style="padding: 8px; text-align: right; font-family: monospace;">${item.rip}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.q1)}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.q2)}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.q3)}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.q4)}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.discount)}</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(item.netPayable)}</td>
        </tr>
    `).join('');

    return `
        <div style="text-align: center; margin-bottom: 20px;">
            <p>${institutionInfo.republic}</p>
            <p>${institutionInfo.ministry}</p>
            <p>${institutionInfo.directorate}</p>
            <p>${institutionInfo.institution}</p>
            <p><strong>السنة المالية: ${institutionInfo.fiscalYear}</strong></p>
            <h3 style="margin-top: 20px;">الجدول التفصيلي للمستفيدين من تعويض استهلاك الكهرباء و الغاز</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
            <thead style="background-color: #fef3c7;">
                <tr>
                    <th style="padding: 8px; text-align: right;">الرقم</th>
                    <th style="padding: 8px; text-align: right;">اسم المستفيد</th>
                    <th style="padding: 8px; text-align: right;">رقم العداد</th>
                    <th style="padding: 8px; text-align: right;">رقم RIP</th>
                    <th style="padding: 8px; text-align: right;">تعويض ث 1</th>
                    <th style="padding: 8px; text-align: right;">تعويض ث 2</th>
                    <th style="padding: 8px; text-align: right;">تعويض ث 3</th>
                    <th style="padding: 8px; text-align: right;">تعويض ث 4</th>
                    <th style="padding: 8px; text-align: right;">الخصم</th>
                    <th style="padding: 8px; text-align: right;">الصافي للدفع</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
            <tfoot style="background-color: #fde68a; font-weight: bold;">
                <tr>
                    <td colspan="8" style="padding: 8px; text-align: center;">المجموع</td>
                    <td style="padding: 8px; text-align: right;">${formatCurrency(totalDiscount)}</td>
                    <td style="padding: 8px; text-align: right;">${formatCurrency(totalNetPayable)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="margin-top: 20px; text-align: right;">
            <p>أوقف الجدول على مجموع مستفيدين قدره: ${totalBeneficiaries}</p>
            <p>أوقف الجدول على مجموع كلي بالأرقام: ${formatCurrency(totalNetPayable)} دج</p>
            <p>أوقف الجدول على مجموع كلي بالأحرف: ${totalNetPayableText}</p>
        </div>
        ${forPrint ? `
            <div style="margin-top: 40px; display: flex; justify-content: space-around; text-align: center;">
                <div><p>المدير</p><br/><br/><p>...............</p></div>
                <div><p>المسير المالي</p><br/><br/><p>...............</p></div>
            </div>
        ` : ''}
    `;
}

export function printReport(appData: AppData) {
    const printContainer = document.getElementById('print-report-content');
    if (!printContainer) {
        console.error("Print container not found.");
        return;
    }
    printContainer.innerHTML = generateReportHTML(appData, true);
    window.print();
}

export function exportToXLSX(appData: AppData) {
    const reportData = getReportData(appData);
    if (reportData.length === 0) {
        alert("لا توجد بيانات للتصدير.");
        return;
    }
    const worksheetData = reportData.map(item => ({
        "الرقم": item.id,
        "اسم المستفيد": item.name,
        "رقم العداد": item.meter,
        "رقم RIP الكامل": item.rip,
        "تعويض ث 1": item.q1,
        "تعويض ث 2": item.q2,
        "تعويض ث 3": item.q3,
        "تعويض ث 4": item.q4,
        "الخصم": item.discount,
        "الصافي للدفع": item.netPayable,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compensation Report");
    XLSX.writeFile(wb, `Compensation_Report_${appData.institutionInfo.fiscalYear}.xlsx`);
}

function generateTxtHeaderLine(appData: AppData, totalNetPayable: number, beneficiaryCount: number): string {
    const { institutionInfo } = appData;
    const treasuryRIP = calculateRIP(institutionInfo.treasuryAccount);
    if (treasuryRIP.includes('خطأ') || treasuryRIP.includes('فارغ')) {
        return "ERROR_HEADER_RIP";
    }

    const startChar = '*'; // 1
    const ripSection = treasuryRIP; // 20
    const totalCents = String(Math.round(totalNetPayable * 100)).padStart(13, '0'); // 13
    const count = String(beneficiaryCount).padStart(7, '0'); // 7
    const month = (institutionInfo.financialMonth || "00").padStart(2, '0'); // 2
    const year = (institutionInfo.fiscalYear || "0000").padStart(4, '0'); // 4
    const orderNum = (institutionInfo.orderNumber || "").padStart(8, '0'); // 8
    const transferNum = (institutionInfo.transferNumber || "").padStart(6, '0'); // 6
    const endChar = '0'; // 1

    return `${startChar}${ripSection}${totalCents}${count}${month}${year}${orderNum}${transferNum}${endChar}`;
}

export function exportToTXT(appData: AppData) {
    const { beneficiaries } = appData;
    
    let roundedNetPayables: number[] = [];
    const txtRecords = getReportData(appData).map(item => {
        const beneficiary = beneficiaries.find(b => b.id === item.id);
        if (!beneficiary) return null;

        const name = beneficiary.name.trim();
        const latinPattern = /^[a-zA-Z\s\-]+$/;
        if (!latinPattern.test(name) || item.rip.includes('خطأ') || item.rip.includes('فارغ')) {
            return null;
        }

        const netPayableRounded = Math.round(item.netPayable * 100) / 100;
        roundedNetPayables.push(netPayableRounded);

        const startChar = '*'; // 1
        const ripSection = item.rip; // 20
        const netCents = String(Math.round(netPayableRounded * 100)).padStart(13, '0'); // 13
        const finalName = name.padEnd(27, ' ').substring(0, 27); // 27
        const endChar = '1'; // 1
        
        const record = `${startChar}${ripSection}${netCents}${finalName}${endChar}`;
        return record.length === 62 ? record : null;

    }).filter(Boolean);

    if (txtRecords.length === 0) {
        alert("لا توجد بيانات صالحة للتصدير إلى TXT. تأكد من صحة أسماء وأرقام حسابات المستفيدين.");
        return;
    }

    const totalRoundedNetPayable = roundedNetPayables.reduce((sum, val) => sum + val, 0);
    const headerLine = generateTxtHeaderLine(appData, totalRoundedNetPayable, txtRecords.length);

    if (headerLine === "ERROR_HEADER_RIP") {
        alert("خطأ: لا يمكن إنشاء السطر الأول لملف TXT. يرجى التحقق من رقم حساب الخزينة في معلومات المؤسسة.");
        return;
    }

    const txtContent = [headerLine, ...txtRecords].join('\n');
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payment_File_${appData.institutionInfo.fiscalYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
