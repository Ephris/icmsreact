<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Letter - {{ $student->user->name }}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        
        .logo-section {
            flex: 1;
        }
        
        .university-name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .campus-name {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .office-name {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .amharic-text {
            font-size: 10pt;
            margin-bottom: 10px;
        }
        
        .ref-section {
            text-align: right;
            flex: 1;
        }
        
        .ref-number {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .date {
            font-weight: bold;
        }
        
        .content {
            margin: 30px 0;
        }
        
        .subject {
            text-align: center;
            font-weight: bold;
            font-size: 13pt;
            margin: 20px 0;
            text-decoration: underline;
        }
        
        .salutation {
            margin: 20px 0 10px 0;
        }
        
        .paragraph {
            margin: 15px 0;
            text-align: justify;
        }
        
        .student-info {
            margin: 20px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-left: 4px solid #000;
        }
        
        .internship-duration {
            margin: 20px 0;
            font-weight: bold;
        }
        
        .closing {
            margin: 30px 0 20px 0;
        }
        
        .signature-section {
            margin-top: 50px;
            position: relative;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            margin: 20px 0 5px 0;
        }
        
        .signature-text {
            font-size: 10pt;
            margin-bottom: 5px;
        }
        
        .stamp-area {
            position: absolute;
            right: 0;
            top: 0;
            width: 150px;
            height: 150px;
            border: 2px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            text-align: center;
            background-color: #f0f0f0;
        }
        
        .footer {
            margin-top: 50px;
            font-size: 10pt;
            border-top: 1px solid #000;
            padding-top: 15px;
        }
        
        .footer-left {
            float: left;
            width: 60%;
        }
        
        .footer-right {
            float: right;
            width: 35%;
            text-align: right;
        }
        
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            <div class="university-name">{{ $universityName }}</div>
            <div class="campus-name">{{ $campusName }}</div>
            <div class="office-name">{{ $officeName }}</div>
            <div class="amharic-text">ሃጫሱ ሁንዴሳ ካምፓስ የዩኒቨርሲቲ ኢንዱስትሪ ተዕዕር አስተባባረ ጽ/ቤተ</div>
        </div>
        <div class="ref-section">
            <div class="ref-number">C/ Ref No: {{ $refNumber }}</div>
            <div class="date">Date: {{ $currentDate }}</div>
        </div>
    </div>

    <div class="content">
        <div style="margin-bottom: 20px;">
            <strong>To:</strong> [Company Name]<br>
            [Company Address]
        </div>

        <div class="subject">
            Subject: Request to Host Internship for {{ $universityName }} Students
        </div>

        <div class="salutation">
            Dear Sir/Madam,
        </div>

        <div class="paragraph">
            {{ $universityName }} is keen to engage in an internship activity as an integral part of its University-Industry Linkage program. The purpose is to enhance knowledge and technology transfer between the University and Industry, providing students with opportunities to acquire technical and operational knowledge.
        </div>

        <div class="paragraph">
            {{ $student->year_of_study ?? '3rd' }} Year {{ $department->name }} department students from the University are expected to engage in industrial practice with proper follow-up and mentoring.
        </div>

        <div class="student-info">
            <strong>Student Information:</strong><br>
            Name: {{ $student->user->first_name }} {{ $student->user->last_name }}<br>
            Department: {{ $department->name }}<br>
            Year of Study: {{ $student->year_of_study ?? '3rd' }}<br>
            CGPA: {{ $student->cgpa ?? 'N/A' }}
        </div>

        <div class="paragraph">
            The Institute Industry Linkage requests your organization to offer an internship position to the above-mentioned student. We express our confidence in a positive response and offer to provide further information if needed.
        </div>

        <div class="internship-duration">
            The internship program is scheduled between {{ \Carbon\Carbon::parse($startDate)->format('F Y') }} to {{ \Carbon\Carbon::parse($endDate)->format('F Y') }}.
        </div>

        <div class="closing">
            Thank you for your consideration.<br><br>
            Sincerely,
        </div>

        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-text">የዩኒቨርሲቲ ኢንድስትሪ ግንኙነት ቢሮ አስተባባሪ</div>
            <div class="signature-text">Industry Linkage Coordinator</div>
            
            <div class="stamp-area">
                <div>
                    {{ $universityName }}<br>
                    Technology Institute<br>
                    University Industry<br>
                    Linkage Office
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="footer-left">
            {{ $website }} / {{ $poBox }} / {{ $city }} / Tel.No {{ $phone }}<br>
            መልስ ሲጽፋልን የእኛን ቁጥር ይጥቀሱ
        </div>
        <div class="footer-right">
            In replying please quote our Ref.No
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>
