<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        try {
            Mail::raw(
                "Name: {$data['name']}\n" .
                "Email: {$data['email']}\n" .
                "Subject: {$data['subject']}\n\n" .
                "Message:\n{$data['message']}",
                function ($message) use ($data) {
                    $message->to('skatephi@gmail.com')
                        ->subject('ICMS Contact Form: ' . $data['subject'])
                        ->replyTo($data['email'], $data['name']);
                }
            );

            return back()->with('success', 'Your message has been sent successfully! We will get back to you soon.');
        } catch (\Exception $e) {
            \Log::error('Contact form email failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to send message. Please try again later.')->withInput();
        }
    }
}

