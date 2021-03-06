(function() {
  function init_datetime() {
    $('.datetime-picker').datetimepicker({
      sideBySide: true,
      format: "YYYY/MM/DD h:mm A",
      defaultDate: undefined
    });
  }

  function on_add_grader(evt, el) {
    el.find(".spinner").each(function(_ii, div) {
      activateSpinner(div);
    });
    
    form_tabs_init_all(el);
  }

  function form_init() {
    init_datetime();

    $('.graders-list').on('cocoon:after-insert', on_add_grader);
    $('.spinner').each(function (_ii, div) {
      activateSpinner(div);
    });

    $("form").submit(function(e) {
      var graderTypeInputs =
          $("li.grader").filter(function(index) {
            return $(this).find("input[id^='assignment_graders_'][id$='_destroy'][value='1']").length == 0;
          }).find("input[id$='_type']");
      debugger
      var graderTypes = graderTypeInputs.map(function() { return $(this).val().replace(/^.*_/, ""); });
      var asHash = Object.create(null);
      graderTypes.map(function() { asHash[this] = (asHash[this] || 0) + 1; });
      var prompt = "";
      for (var type in asHash) {
        if (asHash[type] > 1) {
          prompt += "\t" + asHash[type] + " of " + type + "\n";
        }
      }
      if (prompt !== "") {
        if (!confirm("Are you sure you intended to have multiple graders of the same type?\n" + prompt)) {
          e.preventDefault();
          return false;
        }
      }
      return true;
    });
  }

  

  run_on_page("assignments/new", form_init);
  run_on_page("assignments/create", form_init);
  run_on_page("assignments/edit", form_init);
  run_on_page("assignments/update", form_init);
})();

/*
run_on_page "assignments/show", () ->
  inputs  = []
  by_user = {}

  find_inputs = () ->
    inputs = $(".grade-entry-box")

    by_user = {}
    inputs.each (ii, box) ->
      user_id = $(box).data("user-id")
      by_user[user_id] = ii

  focus_row = (row_number) ->
    next = inputs[row_number]
    if next
      $(next).focus()


  handle_arrow_keys = (event) ->
    user_id    = $(event.target).data("user-id")
    row_number = by_user[user_id]

    switch $.keyDecoder.parse(event)
      when "Up"
        focus_row(row_number - 1)

      when "Down"
        focus_row(row_number + 1)

  handle_form_send = (event) ->
    box = $(event.target).find(".grade-entry-box")[0]
    user_id = $(box).data("user-id")

    row_number = by_user[user_id]
    focus_row(row_number + 1)

  setup_handlers = () ->
    find_inputs()

    $(".grade-entry-box").off "keyup", handle_arrow_keys
    $(".grade-entry-box").on "keyup", handle_arrow_keys

    $(".sub-form").off "ajax:send", handle_form_send
    $(".sub-form").on "ajax:send", handle_form_send

  $(document).ajaxComplete () ->
    $('#ajax-status').text("ajax-status: done")
    setup_handlers()

  setup_handlers()
*/
