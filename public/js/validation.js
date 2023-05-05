jQuery.validator.addMethod(
  "lettersonly",
  function (value, element) {
    return this.optional(element) || /^[a-z,A-Z ]+$/.test(value);
  },
  "Letters only please"
);
jQuery.validator.addMethod(
  "minlength5",
  function (value, element) {
    return this.optional(element) || (value.trim().length >= 5);
  },
  "Minimum 5 characters without space"
);

$(document).ready(function () {
  $("#login").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 5,
        maxlength: 15,
      },
    },
    messages: {
      email: {
        email: "Please enter a valid Email id",
      },
      password: {
        minlength: "too Short!",
        maxlength: "too large",
      },
    },
  });

  $("#signup").validate({
    rules: {
      firstname: {
        required: true,
        minlength: 5,
        lettersonly: true,
      },
      lastname: {
        required: true,
        minlength: 1,
        lettersonly: true,
      },
      email: {
        required: true,
        email: true,
      },
      phoneNumber: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      password: {
        required: true,
        minlength: 5,
        maxlength: 15,
      },
      confirmPassword: {
        required: true,
        equalTo: "#password",
        minlength5: true,
        minlength: 5,
        maxlength: 15,
      },
    },
    messages: {
      firstname: {
        minlength: "Please Enter Your first Name",
        lettersonly: "Letters only please",
      },
      lastname: {
        minlength: "Please Enter Your last Name",
        lettersonly: "Letters only please",
      },
      email: {
        email: "Please enter a valid Email id",
      },
      phoneNumber:"Enter valid phone number ",
      password: {
        minlength: "too Short!",
        maxlength: "too large",
      },
      confirmPassword: {
        equalTo:'password does not match',
      }
    },
  });

  $("#otpLogin").validate({
    rules: {
      phoneNumber: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
    },
    messages: {
      phoneNumber:"Enter valid phone number ",
    },
  });

  $("#billing").validate({
    rules: {
      fname: {
        required: true,
        minlength: 5,
        lettersonly: true,
      },
      lname: {
        required: true,
        minlength: 1,
        lettersonly: true,
      },
      address:{
        required:true,
      },
      city:{
        required:true,
      },
      state:{
        required:true,
      },
      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      pincode: {
        required: true,
        minlength: 5,
        maxlength: 15,
      }
    },
    messages: {
      fname:"this field is required",
    },
    city:'please enter your city'
  });
});

  