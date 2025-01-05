import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Card } from "@/components/ui/card";

const AuthPage = () => {
  const [islogin, setIsLogin] = useState(true);
  const [formdatalogin, setFormDataLogin] = useState({
    email: "",
    password: "",
  });
  const [formdataregister, setFormDataRegister] = useState({
    username: "",
    email: "",
    password: "",
    location: "",
    age: "",
    gender: "",
    interest: "",
    profileImage: null,
  });
  const handleInputLoginChange = (e) => {
    const { name, value } = e.target;
    setFormDataLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleInputRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormDataRegister((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormDataRegister((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://frs-task.onrender.com/api/auth/login",
        {
          email: formdatalogin.email,
          password: formdatalogin.password,
        }
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/dashboard";
      }
    } catch (error) {
        console.log(error);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    let formdata = new FormData();
    formdata.append("username", formdataregister.username);
    formdata.append("email", formdataregister.email);
    formdata.append("password", formdataregister.password);
    formdata.append("location", formdataregister.location);
    formdata.append("age", formdataregister.age);
    formdata.append("gender", formdataregister.gender);
    formdata.append('interest', formdataregister.interest);
    formdata.append("profileImage", formdataregister.profileImage);
    try {
        const response = await axios.post(
            "https://frs-task.onrender.com/api/auth/register",
            formdata,{
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
          if(response.data.success){
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            window.location.href = "/dashboard";
          }
    } catch (error) {
        console.log(error.response?.data?.message || error);
    }
    
  };
  return (
    <>
      <Card className="bg-slate-300">
        <h2 className="text-center text-3xl font-extrabold text-black m-8">
          {islogin ? "Sign in to the Website" : "Create an account"}
        </h2>
        <div className="bg-white rounded-lg shadow-xl">
          {islogin ? (
            <form onSubmit={handleLogin} className="space-y-4 w-[50%] mx-auto">
              <Input
                placeholder="Email"
                name="email"
                value={formdatalogin.email}
                onChange={handleInputLoginChange}
              />
              <Input
                placeholder="Password"
                name="password"
                value={formdatalogin.password}
                onChange={handleInputLoginChange}
              />
              <Button type="submit" className='w-full'>Sign in</Button>
            </form>
          ) : (
            <form
              onSubmit={handleRegister}
              className="space-y-2 w-[50%] mx-auto"
            >
              <Input
                placeholder="UserName"
                name="username"
                value={formdataregister.username}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Email"
                name="email"
                value={formdataregister.email}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Password"
                name="password"
                value={formdataregister.password}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Location"
                name="location"
                value={formdataregister.location}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Age"
                type="number"
                name="age"
                value={formdataregister.age}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Gender"
                name="gender"
                value={formdataregister.gender}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Interests"
                name="interest"
                value={formdataregister.interest}
                onChange={handleInputRegisterChange}
              />
              <Input
                placeholder="Profile Image"
                type="file"
                name="profileImage"
                onChange={handleImageChange}
              />
              <Button type="submit" className='w-full'>Sign up</Button>
            </form>
          )}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              {islogin ? "New to Connect?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!islogin)}
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-300 mb-8"
            >
              {islogin ? "Create a new account" : "Sign in to your account"}
            </button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AuthPage;
