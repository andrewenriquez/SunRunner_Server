function sendRegisterRequest() {
    let email = $('#email').val();
    let password = $('#password').val();
    let fullName = $('#fullName').val();
    let passwordConfirm = $('#passwordConfirm').val();
    let strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;   

    
    // Check to make sure the passwords match
    if (password != passwordConfirm) {
      $('#ServerResponse').html("<span class='red-text text-darken-2'>Passwords do not match.</span>");
      $('#ServerResponse').show();
      return;
    }
    // Check to ensure strong password (must contain at least one: lowercase, uppercase, number, specail character, and be at least 8 characters)
    if( !(password.test(strongRegex.value)) ) {
      $('#ServerResponse').html("<span class='red-text text-darken-2'>Password not strong enough.</span>");
      $('#ServerResponse').show();
      return;
    }

    $.ajax({
     url: '/users/register',
     type: 'POST',
     contentType: 'application/json',
     data: JSON.stringify({email:email, fullName:fullName, password:password}),
     dataType: 'json'
    })
      .done(registerSuccess)
      .fail(registerError);
  }
  
  function registerSuccess(data, textStatus, jqXHR) {
    if (data.success) {  
      window.location = "index.html";
    }
    else {
      $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
      $('#ServerResponse').show();
    }
  }
  
  function registerError(jqXHR, textStatus, errorThrown) {
    if (jqXHR.statusCode == 404) {
      $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
      $('#ServerResponse').show();
    }
    else {
      $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
      $('#ServerResponse').show();
    }
  }
  
  $(function () {
    $('#signup').click(sendRegisterRequest);
  });