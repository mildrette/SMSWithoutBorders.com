import React, { useState } from "react";
import PageAnimationWrapper from "helpers/PageAnimationWrapper.js";
import tw from "twin.macro";
import styled from "styled-components";
import logo from "images/logo.png";
import PasswordStrengthBar from 'react-password-strength-bar';
import useTitle from "helpers/useTitle";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import { FiUserPlus } from "react-icons/fi";
import { Button, toaster, Checkbox } from 'evergreen-ui';
import { registerUser } from 'services/auth.service';
import { Link } from "react-router-dom";
import { ToggleButton } from "components/misc/Buttons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const Container = tw.div`relative min-h-screen bg-white text-white font-medium flex justify-center `;
const Content = tw.div` m-0 text-gray-900  md:flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-1/3 2xl:w-1/4 p-2 sm:p-12`;
const LogoImage = tw.img`h-60 mx-auto block`;
const MainContent = tw.div`flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-bold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;
const Form = tw.form`mx-auto px-4 sm:px-3`;
const Input = tw.input`relative w-full rounded-md py-2 px-3 mb-2 border border-gray-400 hocus:border-primary-900`;
const Label = tw.label`block font-light mb-2`;
const FormGroup = tw.div`relative mb-4`;
const ErrorMessage = tw.p`text-sm text-red-900 mb-4`;
const SubmitButton = tw(Button)`w-full rounded-md py-2`;
const IllustrationContainer = tw.div`lg:flex flex-1 bg-primary-200 hidden`;
const IllustrationImage = styled.div`
  ${props => `background-image: url("${props.imageSrc}");`}
  ${tw` w-full bg-cover bg-center bg-no-repeat`}
`;

const PhoneNumberInput = styled(PhoneInput)`
    ${tw`p-2 border border-gray-400 hocus:border-primary-900 rounded-md mb-2`}
  .PhoneInputCountrySelect {
    ${tw`border-none hocus:border-none mr-8 p-4`}
  }
  .PhoneInputCountryIcon {
    ${tw`border-none hocus:border-none h-5 w-7`}
  }
  .PhoneInputInput {
    ${tw`focus:border-none focus:outline-none appearance-none placeholder-gray-400`}
  }
  .PhoneInputCountryIcon {
    ${tw``}
  }
`;

const PrivacyTerms = (
  <p tw="text-xs mb-4">
    <span>I agree to abide by SMSWithoutborders &nbsp;</span>
    <a
      href="https://smswithoutborders.com/privacy-policy"
      target="_blank"
      rel="noreferrer"
      tw="border-gray-500 text-primary-900 no-underline">
      privacy policy
    </a>
  </p>
);

const SignUpSchema = yup.object().shape({
  username: yup.string().required('User Name is required'),
  phone_number: yup.string().required('Phone Number is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().min(8, 'Password must be at least 8 characters').required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords do not match'),
  acceptTerms: yup.bool().oneOf([true], 'Please review and accept terms and conditions to proceed')
});

const SignUp = () => {
  
  useTitle("SWOB Sign Up");
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(SignUpSchema)
  });


  const handleSignUp = (data) => {

    let splitNumber = parsePhoneNumber(data.phone_number);
    data.phone_number = splitNumber.nationalNumber;
    data.country_code = "+" + splitNumber.countryCallingCode;
    console.log(data);

    setLoading(true);

    registerUser(data)
      .then(response => {
        if (response.status === 200) {
          setLoading(false);
          toaster.success(`Success, Your account ${data.username} has been created`, {
            description: "You will be redirected soon"
          });

          setTimeout(() => {
            window.location.replace("/login")
          }, 1000);
        }
      })
      .catch(error => {
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          switch (error.response.status) {
            case 400:
              setLoading(false);
              toaster.danger("Something went wrong", {
                description: "Its not your its Us. Please try again"
              });
              break;

            case 409:
              setLoading(false);
              toaster.danger("Something went wrong", {
                description: "An account with this number already exists.Please Log In instead"
              });
              break;

            case 500:
              setLoading(false);
              toaster.danger("Something went wrong", {
                description: "Its not you its Us. We are working to resolve it. Please try again"
              });
              break;

            default:
              setLoading(false);
              toaster.danger("Something went wrong", {
                description: "Please try again"
              });
          }

        } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          setLoading(false);
          toaster.danger("Network error", {
            description: "Please check your network and try again"
          });
        } else {
          // Something happened in setting up the request and triggered an Error
          setLoading(false);
          toaster.danger("Network error", {
            description: "Please check your network and try again"
          });
        }
      });
  }

  return (
    <PageAnimationWrapper>
      <Container>
        <Content>
          <MainContainer>
            <LogoImage src={logo} />
            <MainContent>
              <Heading>Sign Up</Heading>
              <FormContainer>
                <Form onSubmit={handleSubmit(handleSignUp)}>

                  <FormGroup>
                    <Label>User Name</Label>
                    <Input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      {...register("username")}
                    />
                    {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone number</Label>

                    <Controller
                      control={control}
                      name="phone_number"
                      render={({ field: { value, onChange } }) => (
                        <PhoneNumberInput
                          flags={flags}
                          international
                          countryCallingCodeEditable={false}
                          placeholder="Enter your phone number"
                          defaultCountry="CM"
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                    {errors.phone_number && <ErrorMessage>{errors.phone_number.message}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Password</Label>
                    <div tw="relative">
                      <Input
                        tw="mb-2"
                        type={toggle ? "text" : "password"}
                        placeholder="Password"
                        {...register("password")}
                      />
                      <ToggleButton
                        toggleFunc={setToggle}
                        value={toggle}
                      />
                    </div>
                    {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                    <PasswordStrengthBar password={watch('password')} />
                  </FormGroup>

                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <div tw="relative">
                      <Input
                        tw="mb-2"
                        type={toggle2 ? "text" : "password"}
                        placeholder="retype password"
                        {...register("confirmPassword")}
                      />
                      <ToggleButton
                        toggleFunc={setToggle2}
                        value={toggle2}
                      />
                    </div>
                    {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
                    <PasswordStrengthBar password={watch("confirmPassword")} />
                  </FormGroup>

                  <Checkbox
                    label={PrivacyTerms}
                    checked={watch("acceptTerms")}
                    {...register('acceptTerms')}
                  />

                  <SubmitButton
                    type="submit"
                    appearance="primary"
                    height={40}
                    iconBefore={loading ? null : FiUserPlus}
                    isLoading={loading}
                    disabled={!watch("acceptTerms")}
                  >
                    <span className="text">{loading ? "Registering" : "Sign Up"}</span>
                  </SubmitButton>
                </Form>

                <p tw="my-8 text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link to="/login" tw="text-primary-900">
                    Sign In
                  </Link>
                </p>

              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer>
            {/* <IllustrationImage imageSrc={illustration} /> */}
            <IllustrationImage imageSrc="https://source.unsplash.com/1600x900/?humanitarian,revolution,research,books,STEM,science" />
          </IllustrationContainer>
        </Content>
      </Container >
    </PageAnimationWrapper >
  )
};

export default SignUp;