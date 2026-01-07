/* Copyright(c) 2025 Intel Corporation
   SPDX-License-Identifier: BSD-3-Clause */

import Tcb from './Tcb.js';
import { expect } from 'chai';
import { TcbError } from "../utils/errors.js";

describe('Tcb', () => {
    describe('Constructor', () => {
        it('should throw an error for invalid CPUSVN length', () => {
            expect(() => new Tcb('0101', 9)).to.throw(TcbError, /Invalid CPUSVN length: 4, CPUSVN: 0101/);
        });

        it('should throw an error when PCESVN is not a number', () => {
            expect(() => new Tcb('01011111000100000000000000000000', 'test')).to.throw(TcbError, /Invalid PCESVN format - should be a number: test/);
        });
    });

    describe('#isLeftTcbEquivalent()', () => {
        it('should return true when the TCB is equivalent to the parameter TCB', () => {
            const tcbEquivalent = new Tcb('01011111000100000000000000000000', 9);
            const tcbRaw = new Tcb('0101ffff000100000000000000000000', 10);

            expect(tcbEquivalent.isLeftTcbEquivalent(tcbRaw)).to.be.true;
        });

        it('should return true when the TCB is the same as parameter TCB', () => {
            const tcbEquivalent = new Tcb('01011111000100000000000000000000', 9);

            expect(tcbEquivalent.isLeftTcbEquivalent(tcbEquivalent)).to.be.true;
        });

        it('should return false when the TCB is not equivalent to the parameter TCB (cpusvn higher but pcesvn lower)', () => {
            const tcbEquivalent = new Tcb('0101ffff000100000000000000000000', 10);
            const tcbRaw = new Tcb('01011111000100000000000000000000', 9);

            expect(tcbEquivalent.isLeftTcbEquivalent(tcbRaw)).to.be.false;
        });
    });

    describe('#computeEquivalent()', () => {
        it('should return the largest equivalent TCB from the sorted list', () => {
            const tcbHighest = new Tcb('02022222000200000000000000000000', 10);
            const tcbMedium = new Tcb('01011111000100000000000000000000', 9);
            const tcbLowest =  new Tcb('01010101000100000000000000000000', 8);
            const sortedTcbList = [
                { tcb: tcbHighest },
                { tcb: tcbMedium },
                { tcb: tcbLowest }
            ];

            const tcbHigherThanHighestEquivalent = new Tcb('03033333000300000000000000000000', 11);
            const tcbWithCpusvnHigherThanMediumAndPcesvnEqualMedium = new Tcb('02011111000200000000000000000000', 9);
            const tcbWithCpusvnEqualAndPcesvnHigherThanMedium = new Tcb('01011111000100000000000000000000', 10);
            const tcbWithCpusvnAndPceSvnHigherThanLowest = new Tcb('02010101000100000000000000000000',  9);

            expect(tcbHighest.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[0].tcb);
            expect(tcbMedium.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[1].tcb);
            expect(tcbLowest.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[2].tcb);

            expect(tcbHigherThanHighestEquivalent.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[0].tcb);
            expect(tcbWithCpusvnHigherThanMediumAndPcesvnEqualMedium.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[1].tcb);
            expect(tcbWithCpusvnEqualAndPcesvnHigherThanMedium.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[1].tcb);
            expect(tcbWithCpusvnAndPceSvnHigherThanLowest.computeEquivalent(sortedTcbList).tcb).to.deep.equal(sortedTcbList[2].tcb);
        });

        it('should return undefined if no equivalent TCB is found', () => {
            const sortedTcbList = [
                { tcb: new Tcb('02022222000200000000000000000000', 10) },
                { tcb: new Tcb('01011111000100000000000000000000', 9) },
                { tcb: new Tcb('01010101000100000000000000000000', 8) },
            ];

            const tcbLowerThanLowestEquivalent = new Tcb('01000101000100000000000000000000', 7);
            const tcbWithMixedCpusvn = new Tcb('02010011000100000000000000000000', 9);

            expect(tcbLowerThanLowestEquivalent.computeEquivalent(sortedTcbList)).to.be.undefined;
            expect(tcbWithMixedCpusvn.computeEquivalent(sortedTcbList)).to.be.undefined;
        });
    });

    describe('#compare()', () => {
        it('should throw an error when TCBs are not comparable', () => {
            const tcbBase = new Tcb('01011111000100000000000000000000', 10);
            const tcbWithHigherCpusvnAndLowerPcesvn = new Tcb('02011111000100000000000000000000', 9);
            const tcbWithLowerCpusvnAndHigherPcesvn = new Tcb('00011111000000000000000000000000', 11);
            const tcbWithMixedCpusvn = new Tcb('02020100000000000000000000000000', 10);

            expect(() => tcbBase.compare(tcbWithHigherCpusvnAndLowerPcesvn)).to.throw(TcbError, /TCBs are not comparable/);
            expect(() => tcbBase.compare(tcbWithLowerCpusvnAndHigherPcesvn)).to.throw(TcbError, /TCBs are not comparable/);
            expect(() => tcbBase.compare(tcbWithMixedCpusvn)).to.throw(TcbError, /TCBs are not comparable/);
        });

        it('should return 0 when TCBs are identical', () => {
            const tcb1 = new Tcb('01011111000100000000000000000000', 9);
            const tcb2 = new Tcb('01011111000100000000000000000000', 9);

            expect(tcb1.compare(tcb2)).to.equal(0);
        });

        it('should return -1 when TCB from the parameter is higher', () => {
            const tcbBase = new Tcb('01011111000100000000000000000000', 9);
            const tcbCpusvnHigherAndPcesvnEqual = new Tcb('02011111000200000000000000000000', 9);
            const tcbCpusvnEqualAndPcesvnHigher = new Tcb('01011111000100000000000000000000', 10);
            const tcbCpusvnAndPcesvnHigher = new Tcb('02011111000200000000000000000000', 10);

            expect(tcbBase.compare(tcbCpusvnHigherAndPcesvnEqual)).to.equal(-1);
            expect(tcbBase.compare(tcbCpusvnEqualAndPcesvnHigher)).to.equal(-1);
            expect(tcbBase.compare(tcbCpusvnAndPcesvnHigher)).to.equal(-1);
        });

        it('should return 1 when TCB from the parameter is lower', () => {
            const tcbBase = new Tcb('01011111000100000000000000000000', 9);
            const tcbCpusvnLowerAndPcesvnEqual = new Tcb('00010000000100000000000000000000', 9);
            const tcbCpusvnEqualAndPcesvnLower = new Tcb('01011111000100000000000000000000', 8);
            const tcbCpusvnAndPcesvnLower = new Tcb('00010000000100000000000000000000', 8);

            expect(tcbBase.compare(tcbCpusvnLowerAndPcesvnEqual)).to.equal(1);
            expect(tcbBase.compare(tcbCpusvnEqualAndPcesvnLower)).to.equal(1);
            expect(tcbBase.compare(tcbCpusvnAndPcesvnLower)).to.equal(1);
        });
    });

});