(function($) {
    $.fn.cssFly = function() {
        var jqueryElem = this;
        var retDiv = $("<div />");
  
        function getGUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function isHexColor(str) {
            var exp = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$", "g");
            return exp.test(str);
        } 
 
        function getConf(cssObj) {
            var ret = new Array();
            var i = 0;
            var indexDecl = 0;

            _.each(cssObj.stylesheet.rules, function(cssRule) {
                i = 0;
                _.each(cssRule.declarations, function(decl) {

                    if (decl.comment && (decl.comment.indexOf('@') == 0) && i > 0) {

                        var previousDecl = cssRule.declarations[i - 1];
                        if (previousDecl.type == 'declaration') {
                            ret.push({
                                varName: decl.comment,
                                defaultValue: previousDecl.value,
                                value: previousDecl.value,
                                property: previousDecl.property,
                                selector: cssRule.selectors[0]
                            });
                        }
                    }
                    i += 1;
                });
            });

            return ret;
        }

        function getColorPickerItem(item, tb, saveCallback) {
            $(tb).minicolors({
                change: function() {
                    item.value = tb.val();
                    saveCallback(item);
                }
            });
        }

        function getSliderItem(item, tb, saveCallback) {
            var puce = $("<div style='display:inline-block;width:20px;height:20px;background-color:grey;cursor:pointer;border-radius:10px'></div>");

            puce.mousedown(function(e) {
                $("body").disableSelection();
                var startX = e.pageX;
                var startValue = parseInt(tb.val(), 10);
                $("body").mousemove(function(e) {

                    var rel = e.pageX - startX;
                    rel = parseInt(rel / 3);

                    var newValue = startValue + rel;

                    tb.val(newValue + "px");
                    item.value = tb.val();
                    saveCallback(item);
                });
                $("body").mouseup(function() {
                    $("body").unbind("mousemove");
                    $("body").unbind("mouseup");
                });

            });

            tb.after(puce);
        }

        function addComponentForItem(item, tb, saveCallback) {

            if (isHexColor(item.value)) {
                return getColorPickerItem(item, tb, saveCallback);
            } else {
                //sinon une couleur pour l'instant
                return getSliderItem(item, tb, saveCallback);
            }

        }

        function createOneItemBlock(item, saveCallback) {

            var mainDiv = $('<div/>');

            var lbl = $('<span>' + item.varName + '</span>');
            lbl.addClass('dataLbl');

            var hidden = $("<input type='hidden' value='" + item.selector + "'></input>");
            hidden.addClass('dataSelector');

            var hidden2 = $("<input type='hidden' value='" + item.property + "'></input>");
            hidden2.addClass('dataProperty');

            var tb = $("<input type='text' ></input>");
            tb.val(item.value);
            tb.addClass('dataTb');

            mainDiv.append(lbl);
            mainDiv.append(tb);
            mainDiv.append(hidden);
            mainDiv.append(hidden2);

            $(tb).keyup(function() {
                item.value = tb.val();
                saveCallback(item);
            });

            mainDiv.addClass('dataDiv');
            addComponentForItem(item, tb, saveCallback)

            return mainDiv;
        }

        function applyChanges(item) {

            $(item.selector).css(item.property, item.value);
        }

        function getButton(text) {
            return $("<input type='button' value='" + text + "'></input>");
        }

        function getDiv() {
            return $('<div/>');
        }

        function compress(str) {
            return Base64.encode(str);
        }

        function uncompress(str) {
            return Base64.decode(str);
        }

        function getCompressedValues() {

            var ret = '';
            var dataDivlist = $(retDiv).find(".dataDiv");
            $.each(dataDivlist, function(index, dataDiv) {

                var varName = $(dataDiv).find('.dataLbl').first().html();
                var varValue = $(dataDiv).find('.dataTb').first().val();
                var varSelector = $(dataDiv).find('.dataSelector').first().val();
                var varProperty = $(dataDiv).find('.dataProperty').first().val();
                ret += varName + ':' + varValue + ':' + varSelector + ':' + varProperty + ';'
            });
            return compress(ret);
        }

        function getConfFromSerializedValue(str) {
            var ret = new Array();
            var items = str.split(';');
            $.each(items, function(index, line) {
                if (line && line != '') {

                    var splitedLine = line.split(':');
                    var item = {};
                    item.varName = splitedLine[0];
                    item.value = splitedLine[1];
                    item.selector = splitedLine[2];
                    item.property = splitedLine[3];

                    ret.push(item);
                }
            });
            return ret;
        }

        function setCompressedValues(str) {

            str = uncompress(str);
            var confArray = getConfFromSerializedValue(str);
            appendTools(confArray);
            $.each(confArray, function(index, value) {
                applyChanges(value);
            });

        }

        function appendTools(conf) {

            function getSaveTools() {
                var isSetting = false;
                var toggleBtn = function() {
                    divTa.toggle();
                    divBtn.toggle();
                };

                var ret = getDiv();
                var divBtn = getDiv();
                var btnGet = getButton('get');
                var btnSet = getButton('set');

                var divTa = getDiv();
                divTa.css('display', 'none');
                var ta = $('<textarea >');
                var btnOk = getButton('ok');

                divTa.append(ta);
                divTa.append(btnOk);

                ta.click(function() {
                    $(this).select();
                })

                btnOk.click(function() {
                    toggleBtn();
                    if (isSetting) {
                        setCompressedValues(ta.val());
                        isSetting = false;
                    }
                });

                btnSet.click(function() {
                    toggleBtn();
                    isSetting = true;
                    ta.val('');
                    ta.focus();
                });

                btnGet.click(function() {
                    toggleBtn();
                    ta.val(getCompressedValues());
                });

                divBtn.append(btnGet);
                divBtn.append(btnSet);
                ret.append(divBtn);
                ret.append(divTa);
                return ret;
            }

            // logique
            retDiv.empty();
            $(jqueryElem).empty();

            _.each(conf, function(confItem) {
                retDiv.append(createOneItemBlock(confItem, applyChanges));
            });

            retDiv.append(getSaveTools());

            $(jqueryElem).append(retDiv);
        }

        //logique applicative
        var cssFileArr = new Array();
        _.each($("head link"), function(data) {
            if (data.rel == "stylesheet") {

                cssFileArr.push(data.href);
            }
        });

        var cssFileDownloaded = 0;
        var confArray = new Array();
        $.each(cssFileArr, function(index, cssFile) {

            $.ajax({
                context: this,
                url: cssFile,
                success: function(cssStr) {

                    var cssObj = cssParse(cssStr);

                    var conf = getConf(cssObj);

                    confArray.push.apply(confArray, conf);

                    cssFileDownloaded += 1;
                    if (cssFileDownloaded === cssFileArr.length) {
                        appendTools(confArray);
                        appendTools(confArray);
                    }
                }
            });
        });


        return this;
    };
})(jQuery);