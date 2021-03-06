import * from 'jest';
import { FV_MPM } from '../../src/format-validators/mpm';
import { MPAction } from '../../src/interfaces/omp-enums';

describe('format-validator: MPA', () => {

    const validate = FV_MPM.validate;

    beforeAll(async () => {
        //
    });

    test('validate a complete action', () => {
        const success = JSON.parse(
            `{
            "version": "0.3.0",
            "action": {
                "type": "${MPAction.MPA_LISTING_ADD}"
            }
        }`);

        let fail: boolean;
        try {
            fail = !validate(success);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(false);
    });

    test('validate another MPA_LISTING_ADD', () => {
        const success = JSON.parse(
            `{
                      "version": "2.4.0",
                      "action": {
                        "type": "${MPAction.MPA_LISTING_ADD}",
                        "generated": 1592210962204,
                        "item": {
                          "information": {
                            "title": "test01",
                            "shortDescription": "test01 summary",
                            "longDescription": "test01 long description that doesn't mean much",
                            "category": [
                              "ROOT",
                              "Particl",
                              "Free Swag"
                            ],
                            "location": {
                              "country": "AU",
                              "address": null
                            },
                            "shippingDestinations": [
                              "AU",
                              "ZA",
                              "-US"
                            ]
                          },
                          "seller": {
                            "address": "pZmMxcdzhqPknghTFHMRKyW4SGndXJw2H9",
                            "signature": "IHKl4Fdzk37S+6OS9/dVPKbTfCAlM+FNdmUxDxhqS4rKebcac4DiqxrnUG//75cqCBUchpeBNlshMfzvyCxGiyg="
                          },
                          "payment": {
                            "type": "SALE",
                            "escrow": {
                              "type": "MAD_CT",
                              "ratio": {
                                "buyer": 100,
                                "seller": 100
                              },
                              "secondsToLock": null,
                              "releaseType": "ANON"
                            },
                            "options": [
                              {
                                "currency": "PART",
                                "basePrice": 1,
                                "shippingPrice": {
                                  "domestic": 0.1,
                                  "international": 0.2
                                },
                                "address": {
                                  "type": "STEALTH",
                                  "address": "TetYrezhU9QHwdLzKq4Q3ajgj13STH8fxtzytWxT312LjmEwBVs7nBTYW6sjamAUfwLQWqGbzESXxF9jNwNnFnpjkhJ3PEKSncizDP"
                                }
                              }
                            ]
                          },
                          "objects": []
                        },
                        "hash": "a90b35ef3d3a77ef2496bb00e6e5009e6267840add627341d79cae0241316a36"
                     }
                    }`);

        let fail: boolean;
        try {
            fail = !validate(success);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(false);
    });

    test('validate missing type', () => {
        const missing_type = JSON.parse(
            `{
            "version": "0.1.0.0",
            "action": {
            }
        }`);
        let fail: boolean;
        try {
            fail = !validate(missing_type);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(true);
    });

    test('validate empty version', () => {
        const empty_version = JSON.parse(
            `{
            "version": "",
            "action": {
                "type": "${MPAction.MPA_LISTING_ADD}"
            }
        }`);
        let fail: boolean;
        try {
            fail = !validate(empty_version);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(true);
    });

    test('validate missing version', () => {
        const missing_version = JSON.parse(
            `{
            "action": {
                "type": "${MPAction.MPA_LISTING_ADD}"
            }
        }`);
        let fail: boolean;
        try {
            fail = !validate(missing_version);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(true);
    });

    test('validate unknown action', () => {
        const unknown_action = JSON.parse(
            `{
            "version": "0.1.0.0",
            "action": {
                "type": "MPA_GAWGD_WFTF"
            }
        }`);
        let fail: boolean;
        try {
            fail = !validate(unknown_action);
        } catch (e) {
            fail = true;
        }
        expect(fail).toBe(true);
    });
});
