import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("이름을 입력하세요.");
        if (!formData.email.trim()) return toast.error("이메일을 입력하세요.");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("유효한 이메일을 입력하세요.");
        if (!formData.password.trim()) return toast.error("비밀번호를 입력하세요.");
        if (formData.password.length < 6) return toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = validateForm();

        if (success) {
            signup(formData);
        }
    };

    return (
        <div className='min-h-screen grid lg:grid-cols-2'>
            {/* 왼쪽 부분  */}
            <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
                <div className='w-full max-w-md space-y-8'>
                    {/* LOGO  */}
                    <div className='text-center mb-8'>
                        <div className='flex flex-col items-center gap-2 group'>
                            <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                                <MessageSquare className='size-6 text-primary' />
                            </div>
                            <h className='text-2xl font-bold mt-2'>회원가입</h>
                            <p className='text-base-content/60'>무료로 시작해 보세요</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='form-control'>
                            <label className='label'>
                                <span className='label-text font-medium'>Full Name</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <User className='size-5 text-base-content/40' />
                                </div>
                                <input
                                    type='text'
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder='YHS'
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='form-control'>
                            <label className='label'>
                                <span className='label-text font-medium'>Email</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Mail className='size-5 text-base-content/40' />
                                </div>
                                <input
                                    type='email'
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder='you@example.com'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='form-control'>
                            <label className='label'>
                                <span className='label-text font-medium'>Password</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='size-5 text-base-content/40' />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder='••••••••'
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type='button'
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className='size-5 text-base-content/40' />
                                    ) : (
                                        <Eye className='size-5 text-base-content/40' />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type='submit' className='btn btn-primary w-full' disabled={isSigningUp}>
                            {isSigningUp ? (
                                <>
                                    <Loader2 className='size-5 animate-spin' />
                                    Loading...
                                </>
                            ) : (
                                "회원가입"
                            )}
                        </button>
                    </form>

                    <div className='text-center'>
                        <p className='text-base-content/60'>
                            이미 계정이 있으신가요?{" "}
                            <Link to='/login' className='link link-primary'>
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* 오른쪽 부분 */}
            <AuthImagePattern title='커뮤니티에 참여하세요' subtitle='친구들과 연결하고, 순간을 공유하며, 사랑하는 사람들과 연락을 유지하세요.' />
        </div>
    );
};

export default SignUpPage;
