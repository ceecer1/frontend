define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/expandable-v2.html'
], function (
    bean,
    bonzo,
    _,
    $,
	detect,
    mediator,
    storage,
    template,
    svgs,
    expandableV2Tpl
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028247
     */
    var ExpandableV2 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;

        if (detect.isBreakpoint({min: 'tablet'})) {
            this.closedHeight = '250';
            this.openedHeight = '500';
        } else {
            this.closedHeight = '150';
            this.openedHeight = '300';
        }
    };

    ExpandableV2.prototype.listener = function () {
        if ((window.pageYOffset + bonzo.viewport().height) > (this.$adSlot.offset().top + this.openedHeight)) {
            // expires in 1 week
            var week = 1000 * 60 * 60 * 24 * 7;

            storage.local.set('gu.commercial.expandable.' + this.params.ecid, true, { expires: Date.now() + week });
            this.$button.toggleClass('button-spin');
            $('.ad-exp__open-chevron').toggleClass('chevron-down');
            this.$ad.css('height', this.openedHeight);
            this.isClosed = false;
            return true;
        }
    };

    ExpandableV2.prototype.create = function () {
        var videoHeight = this.closedHeight - 24,
            videoWidth = (videoHeight * 16) / 9,
            leftMargin = (this.params.videoPositionH === 'center' ?
                'margin-left: ' + videoWidth / -2 + 'px; ' : ''
            ),
            leftPosition = (this.params.videoPositionH === 'left' ?
                'left: ' + this.params.videoHorizSpace + 'px; ' : ''
            ),
            rightPosition = (this.params.videoPositionH === 'right' ?
                'right: ' + this.params.videoHorizSpace + 'px; ' : ''
            ),
            videoDesktop = {
                video: (this.params.videoURL !== '') ?
                    '<iframe id="myYTPlayer" width="' + videoWidth + '" height="' + videoHeight + '" src="' + this.params.videoURL + '?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable_video expandable_video--horiz-pos-' + this.params.videoPositionH + '" style="' + leftMargin + leftPosition + rightPosition + '"></iframe>' : ''
            },
            showmoreArrow = {
                showArrow: (this.params.showMoreType === 'arrow-only' || this.params.showMoreType === 'plus-and-arrow') ?
                    '<button class="ad-exp__open-chevron ad-exp__open">' + svgs('arrowdownicon') + '</button>' : ''
            },
            showmorePlus = {
                showPlus: (this.params.showMoreType === 'plus-only' || this.params.showMoreType === 'plus-and-arrow') ?
                    '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>' : ''
            },
            $expandablev2 = $.create(template(expandableV2Tpl, _.merge(this.params, showmoreArrow, showmorePlus, videoDesktop)));

        this.$ad     = $('.ad-exp--expand', $expandablev2).css('height', this.closedHeight);
        this.$button = $('.ad-exp__open', $expandablev2);

        $('.ad-exp-collapse__slide', $expandablev2).css('height', this.closedHeight);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

        $expandablev2.appendTo(this.$adSlot);

        if (!storage.local.get('gu.commercial.expandable.' + this.params.ecid)) {
            mediator.on('window:scroll', this.listener.bind(this));
        }

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
            $('.ad-exp__close-button').toggleClass('button-spin');
            $('.ad-exp__open-chevron').toggleClass('chevron-down');
            this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
            this.isClosed = !this.isClosed;
        }.bind(this));
    };

    return ExpandableV2;

});
