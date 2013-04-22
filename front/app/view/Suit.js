Ext.define('well.view.Suit', {
    extend: 'Ext.Panel',
    xtype: 'wellsuit',

    config: {
        title: 'Suit',
        styleHtmlContent: true,
        scrollable: 'vertical',
        tpl: [
            'Hello {name}!'
        ]
    }
});
