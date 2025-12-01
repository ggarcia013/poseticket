# -*- coding: utf-8 -*-
{
    'name': 'POS eticket',
    'version': '19.0.1.0.0',
    'author': 'Pronexo',
    'license': 'LGPL-3',
    'sequence': 14,
    'category': 'Point Of Sale',
    'website': 'https://www.pronexo.com',
    'depends': ['point_of_sale', 'l10n_ar', 'l10n_ar_edi'],
    'data': [
        'views/pos_config.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'l10n_ar_pos_eticket/static/src/js/pos_model.js',
            'l10n_ar_pos_eticket/static/src/js/pos_model_ticket.js',
            # 'l10n_ar_pos_eticket/static/src/js/pos_download_invoice.js',
            'l10n_ar_pos_eticket/static/src/css/pos_receipts.css',
            'l10n_ar_pos_eticket/static/src/xml/**/*',
        ]
    },
    'installable': True,
    'application': False,
}