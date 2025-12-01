/** @odoo-module **/
import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { ReceiptHeader } from "@point_of_sale/app/screens/receipt_screen/receipt/receipt_header/receipt_header";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { patch } from '@web/core/utils/patch';
import { useService } from '@web/core/utils/hooks';
import { useState } from '@odoo/owl';
import { serializeDateTime } from "@web/core/l10n/dates";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        console.log('CustomPaymentTicketScreen applied via patch');
        this.orm = useService("orm");
        this.action = useService("action");
        this.state = useState({ click: false });
    },

    async _finalizeValidation() {
        if (this.currentOrder.is_paid_with_cash() || this.currentOrder.get_change()) {
            this.hardwareProxy.openCashbox();
        }

        this.currentOrder.date_order = serializeDateTime(luxon.DateTime.now());
        for (const line of this.paymentLines) {
            if (!line.amount === 0) {
                this.currentOrder.remove_paymentline(line);
            }
        }

        this.pos.addPendingOrder([this.currentOrder.id]);
        this.currentOrder.state = "paid";

        this.env.services.ui.block();
        let syncOrderResult;
        try {
            // 1. Save order to server.
            syncOrderResult = await this.pos.syncAllOrders({ throw: true });
            if (!syncOrderResult) {
                return;
            }

            // 2. Invoice.
            if (this.shouldDownloadInvoice() && this.currentOrder.is_to_invoice()) {
                if (this.currentOrder.raw.account_move) {
                    await this.invoiceService.downloadPdf(this.currentOrder.raw.account_move);
                } else {
                    throw {
                        code: 401,
                        message: "Backend Invoice",
                        data: { order: this.currentOrder },
                    };
                }
            }


            let account_move = this.currentOrder.raw.account_move;

            // 3. Modify Account Move.
            console.log("Account Move:", account_move);
            this.currentOrder.move_vals = await this._get_move_vals(account_move);
            console.log("Move Vals:", this.currentOrder.move_vals);

        } catch (error) {
            if (error instanceof ConnectionLostError) {
                this.afterOrderValidation();
                Promise.reject(error);
            } else if (error instanceof RPCError) {
                this.currentOrder.state = "draft";
                handleRPCError(error, this.dialog);
            } else {
                throw error;
            }
            return error;
        } finally {
            this.env.services.ui.unblock();
        }

        // 3. Post process.
        const postPushOrders = syncOrderResult.filter((order) => order.wait_for_push_order());
        if (postPushOrders.length > 0) {
            await this.postPushOrderResolve(postPushOrders.map((order) => order.id));
        }

        await this.afterOrderValidation(!!syncOrderResult && syncOrderResult.length > 0);
    },

    async _get_move_vals(id) {
        try {
            console.log("Getting move vals for:", id);
            let vals = await this.orm.call('account.move', 'get_move_vals', [id]);
            console.log('vals', vals);
            return vals || {};
        } catch (e) {
            console.log(e);
            return {};
        }
    }
});


//Add move_vals for printing
patch(PosOrder.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        let data = { ...result, ...this.move_vals };
        console.log('Printing data:', data);
        return data;
    },
});



//Change Template
export class CustomOrderReceipt extends OrderReceipt {
    static template = "l10n_ar_pos_eticket.OrderReceipt";
    static components = {
        Orderline,
        ReceiptHeader,
    };
    static props = {
        data: Object,
        formatCurrency: Function,
        basic_receipt: { type: Boolean, optional: true },
    };
    static defaultProps = {
        basic_receipt: false,
    };
}

patch(ReceiptScreen, {
    components: { ...ReceiptScreen.components, CustomOrderReceipt },
});