function Validator(options){
    function getParent (element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;  
        }
    }

    var selectorRules = {};
    function Validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector)
        var errorMessage;
        var rules = selectorRules[rule.selector]
        for(var i=0;i<rules.length;i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked') //khi duoc chon
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break;
        }
        if(errorMessage){
            errorElement.querySelector(options.errorMessage).innerText = errorMessage;
            errorElement.classList.add('invalid')
            return 0;
        }
        else{
            errorElement.querySelector(options.errorMessage).innerText = '';
            errorElement.classList.remove('invalid')
        }
    }

    // lay ra form da truyen vao (#form-1)
    var formElement = document.querySelector(options.form)
    // neu form-1 ton tai
    if(formElement){

        //khi submit form
        formElement.onsubmit = function(e){
            // hủy bỏ sự kiện mặc định
            e.preventDefault();
            var res = 0;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isCheck = Validate(inputElement, rule)
                if(isCheck === 0){
                    // kiểm tra toàn bộ các trường. nếu có trường sai thì gán lại res = 1;
                    res = 1;
                }
            })

            if(res == 0){
                if(typeof options.onSubmit === 'function'){
                    var enableInput = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInput).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                if(input.matches(':checked')){
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) return values;
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                if(input.value === 'not'){
                                    values[input.name] = '';
                                }else{
                                    values[input.name].push(input.value);
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    },{});
                    options.onSubmit(formValues);
                }
            }
        }
        // lấy ra tất cả các trường
        options.rules.forEach(rule=>{
            
            //luu lai cac rule cho moi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }
            // lấy ra element trong thuộc tính selector trong #form-1
            var inputElements = formElement.querySelectorAll(rule.selector) 
            Array.from(inputElements).forEach(inputElement => {
                var errorElement = getParent(inputElement, options.formGroupSelector)
                // click ra ngoài
                inputElement.onblur = function(){
                    // hàm hiển thị sai đúng
                    // 2 tham số: element trong thuộc tính selector, phần tử đang được duyệt
                    Validate(inputElement, rule);
                }
                // khi đang nhập sẽ loại bỏ validate
                inputElement.oninput = function(){
                    errorElement.querySelector(options.errorMessage).innerText = '';
                    errorElement.classList.remove('invalid')
                }
            })
        })
    }
}

Validator.isRequired = function(selector){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector, min){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Mật khẩu tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function(selector, getValue){
    return{
        selector: selector,
        test: function(value){
            return value === getValue() ? undefined : 'Mật khẩu nhập lại không khớp'
        }
    }
}

// ham truyen vao 1 form
Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorMessage: '.form-message',
    // định nghĩa các phương thức
    rules: [
        Validator.isRequired('#fullName'),

        // xet yeu cau truoc moi den kiem tra
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),
        Validator.isRequired('#password'),
        Validator.minLength('#password', 6),
        Validator.isConfirmed('#password_confirmation', function(){
            return document.querySelector('#form-1 #password').value
        }),
        Validator.isRequired('#password_confirmation'),
        Validator.isRequired('input[name="gender"]'),
        Validator.isRequired('#slc'),
        Validator.isRequired('#slc'),
        Validator.isRequired('#avatar'),
    ],
    onSubmit: function(data){
        console.log(data);
    }
})

//show toast
