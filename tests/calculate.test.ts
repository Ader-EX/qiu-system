import {calcRowTotalData} from "@/services/pembelianService";

export function sum(a: number, b: number) {
    return a + b
}


export type RowType = {
    rowSubTotal: number;
    discount: number;
    rowTax: number;
    rowTotal: number;
};

export const calculatePembelianPenjualanHeaderDatas = (
    rows: RowType[],
    additionalDiscountRaw: number,
    expenseRaw: number,
    totalPaid: number,
    totalReturn: number
) => {

    describe("")
}


import {describe, expect, test} from "vitest"

test("Adds 1 + 2 equals 3 ", () => {
    expect(sum(1, 2)).toBe(3)
})

test("Count is Total Data logic correct or not ", () => {
    const datas = calcRowTotalData(2, 2500, 11, 2000)
    expect(datas).toEqual({
        qty: 2,
        unit: 2500,
        taxPct: 11,
        discount: 2000,
        subTotal: 5000,
        taxableBase: 3000,
        tax: 330,
        total: 3330,
    });
})

test("")