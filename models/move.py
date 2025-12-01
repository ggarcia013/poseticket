# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class AccountMove(models.Model):
    _inherit = 'account.move'

    def get_move_vals(self):
        """
        Retorna los valores de la factura para ser mostrados en el ticket POS
        Compatible con Odoo 19.0
        """
        try:
            # Parsear el nombre de la factura de forma segura
            nombre = self.name.split(" ")
            numero = nombre[1] if len(nombre) > 1 else nombre[0]
            letra = nombre[0] if len(nombre) > 1 else ''

            # Construir URL del QR Code solo si existe el código
            qr_code_img = ''
            if self.l10n_ar_afip_qr_code:
                qr_code_img = '/report/barcode/?barcode_type=%s&value=%s&width=%s&height=%s' % (
                    'QR', self.l10n_ar_afip_qr_code, 180, 180
                )

            return {
                'l10n_ar_afip_auth_code': self.l10n_ar_afip_auth_code or '',
                'l10n_ar_afip_qr_code': self.l10n_ar_afip_qr_code or '',
                'l10n_ar_afip_auth_code_due': self.l10n_ar_afip_auth_code_due or '',
                'invoice_date_due': self.invoice_date_due or '',
                'l10n_latam_document_type_id': self.l10n_latam_document_type_id.name if self.l10n_latam_document_type_id else '',

                'l10n_ar_afip_start_date': self.company_id.l10n_ar_afip_start_date or '',
                'l10n_ar_gross_income_number': self.company_id.l10n_ar_gross_income_number or '',
                'street': self.company_id.street or '',
                'city': self.company_id.city or '',

                'invoice_id': self.id,
                'invoice_number': numero,
                'invoice_letter': letra,
                'qr_code_img': qr_code_img,
            }
        except Exception as e:
            # En caso de error, retornar valores vacíos para no romper el ticket
            return {
                'invoice_id': self.id,
                'invoice_number': '',
                'invoice_letter': '',
            }