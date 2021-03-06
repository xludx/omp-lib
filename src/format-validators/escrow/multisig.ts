import { isObject, isNumber, isString, isTxid, isArrayAndContains } from '../../util';
import { FV_CRYPTO } from '../crypto';
import { EscrowType } from '../../interfaces/omp-enums';
import { isNonNegativeNaturalNumber } from '../util';
import { PaymentDataAcceptMultisig, PaymentDataBidMultisig, PaymentDataLockMultisig } from '../../interfaces/omp';

// TODO: max one class per file
// tslint:disable max-classes-per-file

export class FV_MPA_BID_ESCROW_MULTISIG {

    public static validate(payment: PaymentDataBidMultisig): boolean {

        if (!isObject(payment)) {
            throw new Error('escrow mad: missing or not an object!');
        }

        if (payment.escrow !== EscrowType.MULTISIG) {
            throw new Error('escrow mad: expected MULTISIG, received=' + payment.escrow);
        }

        if (!isString(payment.pubKey)) {
            throw new Error('action.buyer.payment.pubKey: missing or not a string');
        }

        if (!isArrayAndContains(payment.prevouts)) {
            throw new Error('action.buyer.payment.prevouts: not an array');
        }

        payment.prevouts.forEach((elem, i) => {
            try {
                FV_CRYPTO.validatePrevout(elem);
            } catch (e) {
                throw new Error('action.buyer.payment.prevouts[' + i + ']: ' + e);
            }
        });

        if (payment.changeAddress) {
            FV_CRYPTO.validateCryptoAddress(payment.changeAddress);
        } else {
            throw new Error('action.buyer.payment.changeAddress: missing or not an object');
        }


        return true;
    }

    constructor() {
        //
    }

}

export class FV_MPA_ACCEPT_ESCROW_MULTISIG {

    public static validate(payment: PaymentDataAcceptMultisig): boolean {
        // The validation for MPA_BID can be re-used here
        // MPA_ACCEPT shares a similar structure.
        FV_MPA_BID_ESCROW_MULTISIG.validate(<any> payment);

        if (!isNonNegativeNaturalNumber(payment.fee) && payment.fee > 0) {
            throw new Error('action.seller.payment.fee: not a non negative number or > 0');
        }

        if (!isArrayAndContains(payment.signatures)) {
            throw new Error('action.seller.payment.signatures: missing or not an array');
        }

        payment.signatures.forEach((elem, i) => {
            FV_CRYPTO.validateSignatureObject(elem);
        });

        if (payment.signatures.length !== payment.prevouts.length) {
            throw new Error('action.seller.payment.signatures: amount of signatures does not match amount of prevouts');
        }

        // payment.release
        {
            if (!isObject(payment.release) || !payment.release) {
                throw new Error('action.seller.payment.release: missing or not an object');
            }

            if (!isArrayAndContains(payment.release.signatures) || !payment.release.signatures) {
                throw new Error('action.seller.payment.release.signatures: missing or not an array');
            }

            payment.release.signatures.forEach((elem, i) => {
                FV_CRYPTO.validateSignatureObject(elem);
            });

            if (payment.release.signatures.length !== 1) {
                throw new Error('action.seller.payment.release.signatures: amount of signatures does not equal 1');
            }
        }

        return true;
    }

    constructor() {
        //
    }

}

export class FV_MPA_LOCK_ESCROW_MULTISIG {

    public static validate(payment: PaymentDataLockMultisig): boolean {

        if (!isArrayAndContains(payment.signatures)) {
            throw new Error('action.buyer.payment.signatures: missing or not an array');
        }

        payment.signatures.forEach((elem, i) => {
            FV_CRYPTO.validateSignatureObject(elem);
        });


        // payment.refund
        {
            if (!isObject(payment.refund) || !payment.refund) {
                throw new Error('action.seller.payment.refund: missing or not an object');
            }

            if (!isArrayAndContains(payment.refund.signatures) || !payment.refund.signatures) {
                throw new Error('action.seller.payment.refund.signatures: missing or not an array');
            }

            payment.refund.signatures.forEach((elem, i) => {
                FV_CRYPTO.validateSignatureObject(elem);
            });

            if (payment.refund.signatures.length !== 1) {
                throw new Error('action.seller.payment.refund.signatures: amount of signatures does not equal 1');
            }
        }

        return true;
    }

    constructor() {
        //
    }
}
