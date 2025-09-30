
// Function to calculate the 20-digit RIP from a CCP number string
export function calculateRIP(ccpNumberString?: string): string {
    try {
        if (!ccpNumberString || typeof ccpNumberString !== 'string' || ccpNumberString.trim() === '') {
            return 'CCP فارغ';
        }
        const ccpValue = ccpNumberString.trim();
        if (!/^\d+$/.test(ccpValue)) {
            return 'رقم CCP غير صالح';
        }
        const ccpPadded = ccpValue.padStart(10, '0');
        const ccpNum = parseInt(ccpValue, 10);
        let ripKey = (ccpNum * 100) % 97;
        ripKey = ripKey + 85;
        if (ripKey >= 97) {
            ripKey = ripKey - 97;
        }
        ripKey = 97 - ripKey;
        const ripKeyStr = ripKey.toString().padStart(2, '0');
        const rip = '00799999' + ccpPadded + ripKeyStr;
        if (rip.length !== 20) {
            return 'خطأ في الطول';
        }
        return rip;
    } catch (e) {
        return 'خطأ غير متوقع';
    }
}

// Function to calculate the quarterly compensation
export function calculateQuarterlyComp(amountNoFees: number, addedValue: number, stateContrib: number): number {
    const amount = Number(amountNoFees) || 0;
    const value = Number(addedValue) || 0;
    const contrib = Number(stateContrib) || 0;

    const compensation = (amount + value - contrib) / 2;
    return compensation > 0 ? compensation : 0;
}

// Function to convert numbers to Arabic text representation
export function numberToArabicText(amount: number): string {
    const roundedAmount = Math.round(amount * 100) / 100;
    const [integerPart, decimalPart] = roundedAmount.toFixed(2).split('.');
    
    const onesArabic = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
                      'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tensArabic = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

    function processThreeDigits(num: number): string {
        if (num === 0) return '';
        
        const hundred = Math.floor(num / 100);
        const remainder = num % 100;
        
        let result = '';
        if (hundred > 0) {
            result += hundreds[hundred];
            if (remainder > 0) result += ' و ';
        }
        
        if (remainder > 0 && remainder < 20) {
            result += onesArabic[remainder];
        } else if (remainder >= 20) {
            const tens = Math.floor(remainder / 10);
            const ones = remainder % 10;
            result += (ones > 0 ? onesArabic[ones] + ' و ' : '') + tensArabic[tens];
        }
        return result;
    }
    
    const intValue = parseInt(integerPart, 10);
    if (intValue === 0 && parseInt(decimalPart, 10) === 0) return 'صفر دينار';
    
    const million = Math.floor(intValue / 1000000);
    const thousand = Math.floor((intValue % 1000000) / 1000);
    const remain = intValue % 1000;
    
    let result = '';
    
    if (million > 0) {
        result += processThreeDigits(million) + (million === 1 ? ' مليون' : (million === 2 ? ' مليونان' : ' ملايين'));
        if (thousand > 0 || remain > 0) result += ' و ';
    }
    
    if (thousand > 0) {
        result += processThreeDigits(thousand) + (thousand === 1 ? ' ألف' : (thousand === 2 ? ' ألفان' : ' آلاف'));
        if (remain > 0) result += ' و ';
    }
    
    if (remain > 0 || intValue === 0) {
        result += processThreeDigits(remain);
    }
    
    if (intValue > 0) {
        result += ' دينار';
    }
    
    const decimalValue = parseInt(decimalPart, 10);
    if (decimalValue > 0) {
        if(intValue > 0) result += ' و ';
        result += processThreeDigits(decimalValue) + ' سنتيم';
    }
    
    return result.replace(/^ و /, '').replace(/ و $/, '').trim();
}

export const formatCurrency = (amount: number) => {
    const numAmount = Number(amount) || 0;
    return numAmount.toFixed(2).replace('.', ',');
};
