###
HTML5 Time polyfill | Jonathan Stipe | https://github.com/jonstipe/time-polyfill
###
(($) ->
  $.fn.inputTime = ->
    readTime = (t_str) ->
      if /^\d\d:\d\d(?:\:\d\d(?:\.\d+)?)?$/.test t_str
        matchData = /^(\d+):(\d+)(?:\:(\d+)(?:\.(\d+))?)?$/.exec t_str
        hourPart = parseInt matchData[1], 10
        minutePart = parseInt matchData[2], 10
        secondPart = if matchData[3]? then parseInt(matchData[3], 10) else 0
        millisecondPart = if matchData[4]? then matchData[4] else '0'
        while millisecondPart.length < 3
	        millisecondPart += '0'
        if millisecondPart.length > 3
          millisecondPart = millisecondPart.substring 0, 3
        millisecondPart = parseInt millisecondPart, 10
        timeObj = new Date()
        timeObj.setHours hourPart
        timeObj.setMinutes minutePart
        timeObj.setSeconds secondPart
        timeObj.setMilliseconds millisecondPart
        timeObj
      else
        throw "Invalid time string: #{t_str}"

    makeTimeString = (time_obj) ->
      t_arr = new Array()
      t_arr.push '0' if time_obj.getHours() < 10
      t_arr.push time_obj.getHours().toString()
      t_arr.push ':'
      t_arr.push '0' if time_obj.getMinutes() < 10
      t_arr.push time_obj.getMinutes().toString()
      if time_obj.getSeconds() > 0 || time_obj.getMilliseconds() > 0
        t_arr.push ':'
        t_arr.push '0' if time_obj.getSeconds() < 10
        t_arr.push time_obj.getSeconds().toString()
        if time_obj.getMilliseconds() > 0
          t_arr.push '.'
          t_arr.push '0' if time_obj.getMilliseconds() < 100
          t_arr.push '0' if time_obj.getMilliseconds() < 10
          t_arr.push time_obj.getMilliseconds().toString()
      t_arr.join ''

    makeTimeDisplayString = (time_obj) ->
      time_arr = new Array()
      if time_obj.getHours() == 0
        time_arr.push '12'
        ampm = 'AM'
      else if time_obj.getHours() > 0 && time_obj.getHours() < 10
        time_arr.push '0'
        time_arr.push time_obj.getHours().toString()
        ampm = 'AM'
      else if time_obj.getHours() >= 10 && time_obj.getHours() < 12
        time_arr.push time_obj.getHours().toString()
        ampm = 'AM'
      else if time_obj.getHours() == 12
        time_arr.push '12'
        ampm = 'PM'
      else if time_obj.getHours() > 12 && time_obj.getHours() < 22
        time_arr.push '0'
        time_arr.push (time_obj.getHours() - 12).toString()
        ampm = 'PM'
      else if time_obj.getHours() >= 22
        time_arr.push (time_obj.getHours() - 12).toString()
        ampm = 'PM';
      time_arr.push ':'
      time_arr.push '0' if time_obj.getMinutes() < 10
      time_arr.push time_obj.getMinutes().toString()
      time_arr.push ':'
      time_arr.push '0' if time_obj.getSeconds() < 10
      time_arr.push time_obj.getSeconds().toString()
      if time_obj.getMilliseconds() > 0
        time_arr.push '.'
        if time_obj.getMilliseconds() % 100 == 0
          time_arr.push (time_obj.getMilliseconds() / 100).toString()
        else if time_obj.getMilliseconds() % 10 == 0
          time_arr.push '0'
          time_arr.push (time_obj.getMilliseconds() / 10).toString()
        else
          time_arr.push '0' if time_obj.getMilliseconds() < 100
          time_arr.push '0' if time_obj.getMilliseconds() < 10
          time_arr.push time_obj.getMilliseconds().toString()
      time_arr.push ' '
      time_arr.push ampm
      time_arr.join ''

    increment = (hiddenField, timeField) ->
      $hiddenField = $ hiddenField
      value = readTime $hiddenField.val()
      step = $hiddenField.data "step"
      max = $hiddenField.data "max"
      if !step? || step == 'any'
        value.setSeconds(value.getSeconds() + 1)
      else
        value.setSeconds(value.getSeconds() + step)
      value.setTime max.getTime() if max? && value > max
      $hiddenField.val(makeTimeString(value)).change()
      $(timeField).val makeTimeDisplayString(value)
      null

    decrement = (hiddenField, timeField) ->
      $hiddenField = $ hiddenField
      value = readTime $hiddenField.val()
      step = $hiddenField.data "step"
      min = $hiddenField.data "min"
      if !step? || step == 'any'
        value.setSeconds(value.getSeconds() - 1)
      else
        value.setSeconds(value.getSeconds() - step)
      value.setTime min.getTime() if min? && value < min
      $hiddenField.val(makeTimeString(value)).change()
      $(timeField).val makeTimeDisplayString(value)
      null

    stepNormalize = (inTime, hiddenField) ->
      $hiddenField = $ hiddenField
      step = $hiddenField.data "step"
      min = $hiddenField.data "min"
      max = $hiddenField.data "max"
      if step? && step != 'any'
        kNum = inTime.getTime()
        raisedStep = step * 1000
        min ?= new Date(0)
        minNum = min.getTime()
        stepDiff = (kNum - minNum) % raisedStep
        stepDiff2 = raisedStep - stepDiff
        if stepDiff == 0
          inTime
        else
          if stepDiff > stepDiff2
            new Date(inTime.getTime() + stepDiff2)
          else
            new Date(inTime.getTime() - stepDiff)
      else
        inTime

    $(this).filter('input[type="time"]').each ->
      $this = $ this
      value = $this.attr 'value'
      min = $this.attr 'min'
      max = $this.attr 'max'
      step = $this.attr 'step'
      className = $this.attr 'class'
      style = $this.attr 'style'
      if value? && /^\d\d:\d\d(?:\:\d\d(?:\.\d+)?)?$/.test value
        value = readTime value
      else
        value = new Date()
      if min?
        min = readTime min
        value.setTime(min.getTime()) if value < min
      if max?
        max = readTime max
        value.setTime(max.getTime()) if value > max
      if step? && step != 'any'
        step = parseFloat step
      hiddenField = document.createElement 'input'
      $hiddenField = $ hiddenField
      $hiddenField.attr
        type: "hidden"
        name: $this.attr 'name'
        value: makeTimeString value
      $hiddenField.data
        min: min
        max: max
        step: step

      timeField = document.createElement 'input'
      $timeField = $ timeField
      $timeField.attr
        type: "text"
        name: $this.attr 'name'
        value: makeTimeDisplayString value
        size: 14
      $timeField.attr 'class', className if className?
      $timeField.attr 'style', style if style?
      $this.replaceWith hiddenField
      $timeField.insertAfter hiddenField

      halfHeight = ($timeField.outerHeight() / 2) + 'px'
      upBtn = document.createElement 'div'
      $(upBtn)
        .addClass('time-spin-btn time-spin-btn-up')
        .css 'height', halfHeight
      downBtn = document.createElement 'div'
      $(downBtn)
        .addClass('time-spin-btn time-spin-btn-down')
        .css 'height', halfHeight
      btnContainer = document.createElement 'div'
      btnContainer.appendChild upBtn
      btnContainer.appendChild downBtn
      $(btnContainer).addClass('time-spin-btn-container').insertAfter timeField

      $timeField.on
        DOMMouseScroll: (event) ->
          if event.originalEvent.detail < 0
            increment hiddenField, timeField
          else
            decrement hiddenField, timeField
          event.preventDefault()
          null
        mousewheel: (event) ->
          if event.originalEvent.wheelDelta > 0
            increment hiddenField, timeField
          else
            decrement hiddenField, timeField
          event.preventDefault()
          null
        keypress: (event) ->
          if event.keyCode == 38 # up arrow
            increment hiddenField, timeField
          else if event.keyCode == 40 # down arrow
            decrement hiddenField, timeField
          else if (event.keyCode not in [35, 36, 37, 39, 46] && 
               event.which not in [8, 9, 32, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 65, 77, 80, 97, 109, 112])
            event.preventDefault()
          null
        change: (event) ->
          $this = $ this
          if /^((?:1[0-2])|(?:0[1-9]))\:[0-5]\d(?:\:[0-5]\d(?:\.\d+)?)?\s[AaPp][Mm]$/.test $this.val()
            matchData = /^(\d\d):(\d\d)(?:\:(\d\d)(?:\.(\d+))?)?\s([AaPp][Mm])$/.exec $this.val()
            hours = parseInt matchData[1], 10
            minutes = parseInt matchData[2], 10
            seconds = parseInt(matchData[3], 10) || 0
            milliseconds = matchData[4]
            unless milliseconds?
              milliseconds = 0
            else if milliseconds.length > 3
              milliseconds = parseInt milliseconds.substring(0, 3), 10
            else if milliseconds.length < 3
              while milliseconds.length < 3
                milliseconds += '0'
              milliseconds = parseInt milliseconds, 10
            else
              milliseconds = parseInt milliseconds, 10
            ampm = matchData[5].toUpperCase()
            timeObj = readTime $hiddenField.val()
            if ampm == 'AM' && hours == 12
              hours = 0
            else if ampm == 'PM' && hours != 12
              hours += 12
            timeObj.setHours hours
            timeObj.setMinutes minutes
            timeObj.setSeconds seconds
            timeObj.setMilliseconds milliseconds
            if min? && timeObj < min
              $hiddenField.val(makeTimeString(min)).change()
              $this.val makeTimeDisplayString(min)
            else if max? && timeObj > max
              $hiddenField.val(makeTimeString(max)).change()
              $this.val makeTimeDisplayString(max)
            else
              timeObj = stepNormalize timeObj, hiddenField
              $hiddenField.val(makeTimeString(timeObj)).change()
              $this.val makeTimeDisplayString(timeObj)
          else
            $this.val makeTimeDisplayString(readTime($hiddenField.val()))
          null
      $(upBtn).on 'mousedown', (event) ->
        increment hiddenField, timeField

        timeoutFunc = (hiddenField, timeField, incFunc) ->
          incFunc hiddenField, timeField
          $(timeField).data 'timeoutID', window.setTimeout(timeoutFunc, 10, hiddenField, timeField, incFunc)
          null

        releaseFunc = (event) ->
          window.clearTimeout $(timeField).data('timeoutID')
          $(document).off 'mouseup', releaseFunc
          $(upBtn).off 'mouseleave', releaseFunc
          null

        $(document).on 'mouseup', releaseFunc
        $(upBtn).on 'mouseleave', releaseFunc

        $(timeField).data 'timeoutID', window.setTimeout(timeoutFunc, 700, hiddenField, timeField, increment)
        null
      $(downBtn).on 'mousedown', (event) ->
        decrement hiddenField, timeField

        timeoutFunc = (hiddenField, timeField, decFunc) ->
          decFunc hiddenField, timeField
          $(timeField).data 'timeoutID', window.setTimeout(timeoutFunc, 10, hiddenField, timeField, decFunc)
          null

        releaseFunc = (event) ->
          window.clearTimeout $(timeField).data('timeoutID')
          $(document).off 'mouseup', releaseFunc
          $(downBtn).off 'mouseleave', releaseFunc
          null
        $(document).on 'mouseup', releaseFunc
        $(downBtn).on 'mouseleave', releaseFunc

        $(timeField).data 'timeoutID', window.setTimeout(timeoutFunc, 700, hiddenField, timeField, decrement)
        null
      null
    this
  $ ->
    $('input[type="time"]').inputTime() unless Modernizr.inputtypes.time
    null
  null
)(jQuery)