/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component } from '@odoo/owl';
import { patch } from '@web/core/utils/patch';

class CustomInvoiceButton extends Component {
    static template = "l10n_ar_pos_eticket.InvoiceButton";

    onClick() {
        this.props.toggleIsToInvoice();
    }
}

registry.category("pos_screens").add("CustomPaymentScreen", (PaymentScreenClass) => {
    patch(PaymentScreenClass.prototype, {
        setup() {
            super.setup();
            this.showInvoiceButton = !this.env.pos.config.pos_auto_invoice;

            this.components = { ...this.components, CustomInvoiceButton };
        },

        toggleIsToInvoice() {
            this.env.pos.get_order().set_to_invoice(true);
        },

        get invoiceButtonComponent() {
            return this.showInvoiceButton ? CustomInvoiceButton : null;
        }
    });

    return PaymentScreenClass;
});