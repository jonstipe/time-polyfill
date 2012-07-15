(function($){
  $(function(){
    if (!Modernizr.inputtypes.time) {
      var readTime = function(t_str) {
        if (/^\d\d:\d\d(?:\:\d\d(?:\.\d+)?)?$/.test(t_str)) {
          var matchData = /^(\d+):(\d+)(?:\:(\d+)(?:\.(\d+))?)?$/.exec(t_str),
            hourPart = parseInt(matchData[1], 10),
            minutePart = parseInt(matchData[2], 10),
            secondPart = (matchData[3] !== undefined) ? parseInt(matchData[3], 10) : 0,
            millisecondPart = (matchData[4] !== undefined) ? matchData[4] : '0';
          while (millisecondPart.length < 3) {
  	        millisecondPart += '0';
          }
          if (millisecondPart.length > 3) {
            millisecondPart = millisecondPart.substring(0, 3)
          }
          millisecondPart = parseInt(millisecondPart, 10);
          var timeObj = new Date();
          timeObj.setHours(hourPart);
          timeObj.setMinutes(minutePart);
          timeObj.setSeconds(secondPart);
          timeObj.setMilliseconds(millisecondPart);
          return timeObj;
        } else throw "Invalid time string: " + t_str;
      };
      var makeTimeString = function(time_obj) {
        var t_arr = new Array();
        if (time_obj.getHours() < 10) t_arr.push('0');
        t_arr.push(time_obj.getHours().toString());
        t_arr.push(':');
        if (time_obj.getMinutes() < 10) t_arr.push('0');
        t_arr.push(time_obj.getMinutes().toString());
        if (time_obj.getSeconds() > 0 || time_obj.getMilliseconds() > 0) {
          t_arr.push(':');
          if (time_obj.getSeconds() < 10) t_arr.push('0');
          t_arr.push(time_obj.getSeconds().toString());
          if (time_obj.getMilliseconds() > 0) {
            t_arr.push('.');
            if (time_obj.getMilliseconds() < 100) t_arr.push('0');
            if (time_obj.getMilliseconds() < 10) t_arr.push('0');
            t_arr.push(time_obj.getMilliseconds().toString());
          }
        }
        return t_arr.join('');
      };
      var makeTimeDisplayString = function(time_obj) {
        var time_arr = new Array();
        var ampm;
        if (time_obj.getHours() == 0) {
          time_arr.push('12');
          ampm = 'AM';
        } else if (time_obj.getHours() > 0 && time_obj.getHours() < 10) {
          time_arr.push('0')
          time_arr.push(time_obj.getHours().toString());
          ampm = 'AM';
        } else if (time_obj.getHours() >= 10 && time_obj.getHours() < 12) {
          time_arr.push(time_obj.getHours().toString());
          ampm = 'AM';
        } else if (time_obj.getHours() == 12) {
          time_arr.push('12');
          ampm = 'PM';
        } else if (time_obj.getHours() > 12 && time_obj.getHours() < 22) {
          time_arr.push('0');
          time_arr.push((time_obj.getHours() - 12).toString());
          ampm = 'PM';
        } else if (time_obj.getHours() >= 22) {
          time_arr.push((time_obj.getHours() - 12).toString());
          ampm = 'PM';
        }
        time_arr.push(':');
        if (time_obj.getMinutes() < 10) time_arr.push('0');
        time_arr.push(time_obj.getMinutes().toString());
        time_arr.push(':');
        if (time_obj.getSeconds() < 10) time_arr.push('0');
        time_arr.push(time_obj.getSeconds().toString());
        if (time_obj.getMilliseconds() > 0) {
          time_arr.push('.');
          if (time_obj.getMilliseconds() % 100 == 0) {
            time_arr.push((time_obj.getMilliseconds() / 100).toString());
          } else if (time_obj.getMilliseconds() % 10 == 0) {
            time_arr.push('0');
            time_arr.push((time_obj.getMilliseconds() / 10).toString());
          } else {
            if (time_obj.getMilliseconds() < 100) time_arr.push('0');
            if (time_obj.getMilliseconds() < 10) time_arr.push('0');
            time_arr.push(time_obj.getMilliseconds().toString());
          }
        }
        time_arr.push(' ');
        time_arr.push(ampm);
        return time_arr.join('');
      };
      var increment = function(hiddenField, timeField) {
        var $hiddenField = $(hiddenField);
        var value = readTime($hiddenField.val());
        var step = $hiddenField.data("step");
        var max = $hiddenField.data("max");
        if (step === undefined || step == 'any') value.setSeconds(value.getSeconds() + 1);
        else value.setSeconds(value.getSeconds() + step);
        if (max !== undefined && value > max) value.setTime(max.getTime());
        $hiddenField.val(makeTimeString(value)).change();
        $(timeField).val(makeTimeDisplayString(value));
      };
      var decrement = function(hiddenField, timeField) {
        var $hiddenField = $(hiddenField);
        var value = readTime($hiddenField.val());
        var step = $hiddenField.data("step");
        var min = $hiddenField.data("min");
        if (step === undefined || step == 'any') value.setSeconds(value.getSeconds() - 1);
        else value.setSeconds(value.getSeconds() - step);
        if (min !== undefined && value < min) value.setTime(min.getTime());
        $hiddenField.val(makeTimeString(value)).change();
        $(timeField).val(makeTimeDisplayString(value));
      };
      var stepNormalize = function(inTime, hiddenField) {
        var $hiddenField = $(hiddenField);
        var step = $hiddenField.data("step");
        var min = $hiddenField.data("min");
        var max = $hiddenField.data("max");
        if (step !== undefined && step != 'any') {
          var kNum = inTime.getTime();
          var raisedStep = step * 1000;
          if (min !== undefined) {
            var minNum = min.getTime();
            var stepDiff = (kNum - minNum) % raisedStep;
            var stepDiff2 = raisedStep - stepDiff;
            if (stepDiff == 0) return inTime;
            else {
              if (stepDiff > stepDiff2) return new Date(inTime.getTime() + stepDiff2);
              else return new Date(inTime.getTime() - stepDiff);
            }
          } else if (max !== undefined) {
            var maxNum = max.getTime();
            var stepDiff = (maxNum - kNum) % raisedStep;
            var stepDiff2 = raisedStep - stepDiff;
            if (stepDiff == 0) return inTime;
            else {
              if (stepDiff > stepDiff2) return new Date(inTime.getTime() - stepDiff2);
              else return new Date(inTime.getTime() + stepDiff);
            }
          } else return inTime;
        } else return inTime;
      }
      $('input[type="time"]').each(function(index) {
        var $this = $(this), value, min, max, step;
        if ($this.attr('value') !== undefined && /^\d\d:\d\d(?:\:\d\d(?:\.\d+)?)?$/.test($this.attr('value'))) value = readTime($this.attr('value'));
        else value = new Date();
        if ($this.attr('min') !== undefined) {
          min = readTime($this.attr('min'));
          if (value < min) value.setTime(min.getTime());
        }
        if ($this.attr('max') !== undefined) {
          max = readTime($this.attr('max'));
          if (value > max) value.setTime(max.getTime());
        }
        if ($this.attr('step') == 'any') step = 'any';
        else if ($this.attr('step') !== undefined) step = parseFloat($this.attr('step'));

        var hiddenField = document.createElement('input');
        var $hiddenField = $(hiddenField);
        $hiddenField.attr({
          type: "hidden",
          name: $this.attr('name'),
          value: makeTimeString(value)
        });

        $hiddenField.data("step", step);
        $hiddenField.data("min", min);
        $hiddenField.data("max", max);

        var timeField = document.createElement('input');
        var $timeField = $(timeField);
        $timeField.attr({
          type: "text",
          name: $this.attr('name'),
          value: makeTimeDisplayString(value),
          size: 14
        });

        $this.replaceWith(hiddenField);
        $timeField.insertAfter(hiddenField);

        var halfHeight = ($timeField.outerHeight() / 2) + 'px';
        var upBtn = document.createElement('div');
        $(upBtn)
          .addClass('time-spin-btn time-spin-btn-up')
          .css('height', halfHeight);
        var downBtn = document.createElement('div');
        $(downBtn)
          .addClass('time-spin-btn time-spin-btn-down')
          .css('height', halfHeight);
        var btnContainer = document.createElement('div');
        btnContainer.appendChild(upBtn);
        btnContainer.appendChild(downBtn);
        $(btnContainer).addClass('time-spin-btn-container').insertAfter(timeField);

        $timeField.bind({
          DOMMouseScroll: function(event) {
            if (event.detail < 0) increment(hiddenField, timeField);
            else decrement(hiddenField, timeField);
            event.preventDefault();
          },
          mousewheel: function(event) {
            if (event.wheelDelta > 0) increment(hiddenField, timeField);
            else decrement(hiddenField, timeField);
            event.preventDefault();
          },
          keypress: function(event) {
            if (event.keyCode == 38) // up arrow
              increment(hiddenField, timeField);
            else if (event.keyCode == 40) // down arrow
              decrement(hiddenField, timeField);
            else if ([35, 36, 37, 39, 46].indexOf(event.keyCode) == -1 && 
                 [8, 9, 32, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 65, 77, 80, 97, 109, 112].indexOf(event.which) == -1)
              event.preventDefault();
          },
          change: function(event) {
            var $this = $(this);
            if (/^((?:1[0-2])|(?:0[1-9]))\:[0-5]\d(?:\:[0-5]\d(?:\.\d+)?)?\s[AaPp][Mm]$/.test($this.val())) {
              var matchData = /^(\d\d):(\d\d)(?:\:(\d\d)(?:\.(\d+))?)?\s([AaPp][Mm])$/.exec($this.val()),
                hours = parseInt(matchData[1], 10),
                minutes = parseInt(matchData[2], 10),
                seconds = parseInt(matchData[3], 10) || 0,
                milliseconds = matchData[4];
              if (milliseconds === undefined) milliseconds = 0;
              else if (milliseconds.length > 3) milliseconds = parseInt(milliseconds.substring(0, 3), 10);
              else if (milliseconds.length < 3) {
                while (milliseconds.length < 3) {
                  milliseconds += '0';
                }
                milliseconds = parseInt(milliseconds, 10);
              } else milliseconds = parseInt(milliseconds, 10);
              var ampm = matchData[5].toUpperCase(),
                timeObj = readTime($hiddenField.val());
              if ((ampm == 'AM') && (hours == 12)) hours = 0;
              else if ((ampm == 'PM') && (hours != 12)) hours += 12;
              timeObj.setHours(hours);
              timeObj.setMinutes(minutes);
              timeObj.setSeconds(seconds);
              timeObj.setMilliseconds(milliseconds);
              if (min !== undefined && timeObj < min) {
                $hiddenField.val(makeTimeString(min)).change();
                $this.val(makeTimeDisplayString(min));
              } else if (max !== undefined && timeObj > max) {
                $hiddenField.val(makeTimeString(max)).change();
                $this.val(makeTimeDisplayString(max));
              } else {
                timeObj = stepNormalize(timeObj, hiddenField);
                $hiddenField.val(makeTimeString(timeObj)).change();
                $this.val(makeTimeDisplayString(timeObj));
              }
            } else $this.val(makeTimeDisplayString(readTime($hiddenField.val())));
          }
        });
        $(upBtn).bind({
          mousedown: function (e) {
            increment(hiddenField, timeField);

            var timeoutFunc = function (hiddenField, timeField, incFunc) {
                incFunc(hiddenField, timeField);

                timeField.timeoutID = window.setTimeout(timeoutFunc, 10, hiddenField, timeField, incFunc);
              };

            var releaseFunc = function (e) {
                window.clearTimeout(timeField.timeoutID);
                $(document).unbind('mouseup', releaseFunc);
                $(upBtn).unbind('mouseleave', releaseFunc);
              };

            $(document).bind('mouseup', releaseFunc);
            $(upBtn).bind('mouseleave', releaseFunc);

            timeField.timeoutID = window.setTimeout(timeoutFunc, 700, hiddenField, timeField, increment);
          }
        });
        $(downBtn).bind({
          mousedown: function (e) {
            decrement(hiddenField, timeField);

            var timeoutFunc = function (hiddenField, timeField, decFunc) {
                decFunc(hiddenField, timeField);

                timeField.timeoutID = window.setTimeout(timeoutFunc, 10, hiddenField, timeField, decFunc);
              };

            var releaseFunc = function (e) {
                window.clearTimeout(timeField.timeoutID);
                $(document).unbind('mouseup', releaseFunc);
                $(downBtn).unbind('mouseleave', releaseFunc);
              };

            $(document).bind('mouseup', releaseFunc);
            $(downBtn).bind('mouseleave', releaseFunc);

            timeField.timeoutID = window.setTimeout(timeoutFunc, 700, hiddenField, timeField, decrement);
          }
        });
      });
    }
  });
})(jQuery);