<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class FileValidator
{
    /**
     * Maximum file size in bytes (10MB).
     */
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * Allowed MIME types for file uploads.
     */
    private const ALLOWED_MIME_TYPES = [
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',

        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        // Text files
        'text/plain',
        'text/csv',

        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',

        // Audio
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/mp4',
        'audio/3gpp',

        // Video containers that may contain audio (for voice messages)
        'video/webm',
        'video/mp4',
    ];

    /**
     * Validate an uploaded file.
     */
    public function validate(UploadedFile $file): array
    {
        $validator = Validator::make(['file' => $file], [
            'file' => [
                'required',
                'file',
                'max:' . (self::MAX_FILE_SIZE / 1024), // Laravel expects KB
            ],
        ]);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->all(),
            ];
        }

        // Additional MIME type validation
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
            return [
                'valid' => false,
                'errors' => ['File type not allowed.'],
            ];
        }

        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'errors' => ['File size exceeds maximum allowed size of 10MB.'],
            ];
        }

        // Check for potentially malicious files
        if ($this->isPotentiallyMalicious($file)) {
            return [
                'valid' => false,
                'errors' => ['File appears to be potentially malicious.'],
            ];
        }

        return [
            'valid' => true,
            'errors' => [],
        ];
    }

    /**
     * Check if file is potentially malicious.
     */
    private function isPotentiallyMalicious(UploadedFile $file): bool
    {
        $filename = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        
        // Check for double extensions
        if (preg_match('/\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)\.[a-z]+$/i', $filename)) {
            return true;
        }

        // Check for executable extensions
        $executableExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'app'];
        if (in_array($extension, $executableExtensions, true)) {
            return true;
        }

        // Check file content for suspicious patterns
        $content = file_get_contents($file->getPathname());
        $suspiciousPatterns = [
            '/<\?php/i',
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get allowed file extensions.
     */
    public function getAllowedExtensions(): array
    {
        return [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'txt', 'csv',
            'zip', 'rar', '7z',
        ];
    }

    /**
     * Get maximum file size in human readable format.
     */
    public function getMaxFileSize(): string
    {
        return '10MB';
    }
}
