/** @odoo-module **/
import { Component } from '@odoo/owl';
import { patch } from '@web/core/utils/patch';
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

export class CustomInvoiceButton extends Component {
    static template = "l10n_ar_pos_eticket.InvoiceButton";

    onClick() {
        this.props.toggleIsToInvoice();
    }
}

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.showInvoiceButton = !this.pos.config.pos_auto_invoice;
    },

    toggleIsToInvoice() {
        this.pos.get_order().set_to_invoice(true);
    },

    get invoiceButtonComponent() {
        return this.showInvoiceButton ? CustomInvoiceButton : null;
    }
});