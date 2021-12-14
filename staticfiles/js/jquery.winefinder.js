$(document).ready(function() {
    var app = {
        el: $({}),
        window: $(window),
        document: $(document),
        html: $('html'),
        body: $('body')
    }

    app.home = {
        init: function() {
            this.support();
            app.window.trigger('resize');
        },
        support: function() {
            var css = [];
            if (app.support.ie) css.push('ie', 'ie' + app.support.ie);
            if (app.support.css3) css.push('css3');
            if (app.support.samsung) css.push('samsung');
            app.body.addClass(css.join(' '));
        }
    }

    app.wine = {
        data: {},
        template: {},
        init: function() {
            var _this = this;

            if (!Handlebars) return;

            Handlebars.registerPartial(
                'card', 
                '<div class="w-card">\
                    <ul class="w-card__cell">\
                        {{#lists}}\
                        <li class="w-card__item">\
                            <a class="w-card__link" href="#" data-id="{{id}}">\
                                <div class="w-card__box">\
                                    <div class="w-card__circle" data-value="{{percent}}">\
                                        <span></span>\
                                    </div>\
                                    <div class="w-card__bottle">\
                                        <img src="{{thumb}}" alt="">\
                                    </div>\
                                    <div class="w-card__meta">\
                                        <div class="w-card__grade">{{grade}}</div>\
                                        <div class="w-card__rating" data-rating="{{grade}}"></div>\
                                        <div class="w-card__ratings">{{numberFormat ratings decimalLength="0"}} ratings</div>\
                                        <div class="w-card__name">{{name}}</div>\
                                        <div class="w-card__title">{{title}}</div>\
                                        <div class="w-card__flag">\
                                            <i class="w-card__flag-icon w-card__flag-icon--{{flag.icon}}"></i>\
                                            <span class="w-card__flag-text">{{flag.text}}</span>\
                                        </div>\
                                    </div>\
                                </div>\
                            </a>\
                        </li>\
                        {{/lists}}\
                    </ul>\
                </div>'
            );

            Handlebars.registerPartial(
                'detail',
                '<div class="w-detail">\
                    <div class="w-detail__inner">\
                        <div class="w-detail__top">\
                            <div class="w-detail__name">{{name}}</div>\
                            <div class="w-detail__title">{{title}}</div>\
                            <div class="w-detail__tags">\
                                <div class="w-tag">\
                                    {{#tags}}\
                                    <div class="w-tag__item">\
                                        {{#if icon}}<i class="w-tag__icon w-tag__icon--{{icon}}"></i>{{/if}}\
                                        <span class="w-tag__text">{{text}}</span>\
                                    </div>\
                                    {{/tags}}\
                                </div>\
                            </div>\
                            <div class="w-detail__circle" data-value="{{percent}}">\
                                <span></span>\
                            </div>\
                        </div>\
                        <div class="w-detail__bottle">\
                            <img src="{{detail}}" alt="">\
                        </div>\
                        <div class="w-detail__content">\
                            <div class="w-detail__grade">{{grade}}</div>\
                            <div class="w-detail__rating" data-rating="{{grade}}"></div>\
                            <div class="w-detail__ratings">{{numberFormat ratings decimalLength="0"}} ratings</div>\
                            <div class="w-detail__slider">\
                                <div class="w-range">\
                                    <div class="w-range__item">\
                                        <div class="w-range__txt">Light</div>\
                                        <div class="w-range__bar">\
                                            <span class="w-range__handle" data-value="{{range.[0]}}"></span>\
                                        </div>\
                                        <div class="w-range__txt">Bold</div>\
                                    </div>\
                                    <div class="w-range__item">\
                                        <div class="w-range__txt">Smooth</div>\
                                        <div class="w-range__bar">\
                                            <span class="w-range__handle" data-value="{{range.[1]}}"></span>\
                                        </div>\
                                        <div class="w-range__txt">Tannic</div>\
                                    </div>\
                                    <div class="w-range__item">\
                                        <div class="w-range__txt">Dry</div>\
                                        <div class="w-range__bar">\
                                            <span class="w-range__handle" data-value="{{range.[2]}}"></span>\
                                        </div>\
                                        <div class="w-range__txt">Sweet</div>\
                                    </div>\
                                    <div class="w-range__item">\
                                        <div class="w-range__txt">Soft</div>\
                                        <div class="w-range__bar">\
                                            <span class="w-range__handle" data-value="{{range.[3]}}"></span>\
                                        </div>\
                                        <div class="w-range__txt">Acidic</div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
            );

            _this.template.card = Handlebars.compile('{{> card}}');
            _this.template.detail = Handlebars.compile('{{> detail}}');
            // _this.template.card = Handlebars.compile($("#template-card").html());
            // _this.template.detail = Handlebars.compile($("#template-detail").html());

            // slider
            $('.w-slider__bar').slider({
                orientation: "horizontal",
                range: "min",
                max: 100,
            });

            _this.search();
            _this.handlers();

            $.ajax({
                    method: 'GET',
                    url: "http://127.0.0.1:8000/gettopwine/",
                    data: "",
                    cache: false,
                    dataType: 'json',
                }).done(function(data) {
                    _this.data = data;

                    var template = $(_this.template.card(data));

                    $(".card").html(template);
                    template.find('.w-card__item').each(_this.render);

                    var section = $('.home-section--wine');
                    section.show();

                    $('html, body').stop().animate({ 'scrollTop': section.offset().top }, 400);
                }).fail(function() {
                    console.log('error');
                });
        },
        search: function() {
            var _this = this;

            $('form').on('submit', function(e) {

                var data = {}
                let ajaxUrl ="";
                let sendData ="";
                // form name
                if (this.name == 'search') {
                    ajaxUrl ="http://127.0.0.1:8000/getsearchwine/";
                    let val = $('#slider1').slider("value");
                    let va2 = $('#slider2').slider("value");
                    let va3 = $('#slider3').slider("value");
                    let va4 = $('#slider4').slider("value");
                     sendData = "val="+val+"&va2="+va2+"&va3="+va3+"&va4="+va4;
                     sendData += "&name="+$('#search_name').val()
                } else {
                    ajaxUrl ="http://127.0.0.1:8000/getwine/";
                    let val = $('#slider1').slider("value");
                    let va2 = $('#slider2').slider("value");
                    let va3 = $('#slider3').slider("value");
                    let va4 = $('#slider4').slider("value");
                    sendData = "val="+val+"&va2="+va2+"&va3="+va3+"&va4="+va4;
                }


                $.ajax({
                    method: 'GET',
                    url: ajaxUrl,
                    data: sendData,
                    cache: false,
                    dataType: 'json',
                }).done(function(data) {
                    _this.data = data;
                    console.log(data)
                    if(data.lists.length ==0) return;
                    var template = $(_this.template.card(data));

                    $(".card").html(template);
                    template.find('.w-card__item').each(_this.render);

                    var section = $('.home-section--wine');
                    section.show();

                    $('html, body').stop().animate({ 'scrollTop': section.offset().top }, 400);
                }).fail(function() {
                    console.log('error');
                });

                return false;
            });
        },
        render: function() {
            var prefix = this.className.split('__')[0];
            var circle = $(this).find('.' + prefix + '__circle');
            var circleValue = circle.data('value');

            if (circleValue) {
                circle.circleProgress({
                    startAngle: -Math.PI / 2,
                    value: circleValue / 100,
                    lineCap: 'round',
                    fill: {color: '#723cbd'},
                    emptyFill: '#e8e1f1',
                }).on('circle-animation-progress', function(event, progress, stepValue) {
                    $(this).find('span').html(Math.round(stepValue * 100) + '<i>%</i>');
                });
            }

            var rating = $(this).find('.' + prefix + '__rating');
            var ratingValue = rating.data('rating');
            var max = 5;
            var html = [];

            if (ratingValue) {
                for (i = 1; i <= max; i++) {
                    if (i <= Math.floor(ratingValue)) {
                        html.push('<span class="w-rate w-rate--on"></span>');
                    } else {
                        html.push('<span class="w-rate"></span>');
                    }
                }

                rating.append(html.join(''));
            }
        },
        handlers: function() {
            $('.card').on('click', '.w-card__link', this, this.onClickCard);
            app.window.on('resize', this.onResize);

            this.onResize();
        },
        onClickCard: function(e) {
            var _this = e.data;
            e.preventDefault();

            var id = $(this).data('id');
            var template = $(_this.template.detail(_this.data.lists.filter(function(o) {
                return o.id == id;
            })[0] || {}));

            $('#modal-detail').html(template).modal({
                fadeDuration: 100,
                showClose: false
            });

            template.each(_this.render);

            setTimeout(_this.onResize, 100);
        },
        onResize: function() {
            $('.w-range__item').each(function() {
                var bar = $(this).find('.w-range__bar');
                var handle = $(this).find('.w-range__handle');
                var value = Number(handle.data('value'));
                handle.css('left', (bar.width() - handle.width()) / 100 * value);
            });
        }
    }

    app.resize = {
        init: function() {
            app.window.on('resize', $.proxy(this.onResize, this));
        },
        kill: function() {
            app.window.off('resize', $.proxy(this.onResize, this));
        },
        onResize: function(e) {
            var w = app.window.width();
            app.isDesktop = w >= 1024;
            app.isTablet = w >= 768 && w < 1024;
            app.isMobile = w < 768;
            app.el.trigger('resized');
        }
    }

    app.detectIE = (function() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // Edge => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    })();

    app.support = {
        ie: app.detectIE,
        css3: !app.detectIE || app.detectIE && app.detectIE >= 10,
        transitions: app.detectIE && app.detectIE && app.detectIE >= 9,
        samsung: (function() {
            return navigator.userAgent.match(/SAMSUNG|Samsung|SGH-[I|N|T]|GT-[I|N]|SM-[A|N|P|T|Z]|SHV-E|SCH-[I|J|R|S]|SPH-L/i);
        })()
    }

    $(['resize', 'home', 'wine']).each(function(i, c) {
        app[c].init();
    });
});