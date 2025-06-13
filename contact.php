<?php
// Configuración
$to_email = "info@goldenclinica.com"; // Cambia por tu email real
$subject_prefix = "[Golden Clínica Dental] ";
$success_message = "¡Gracias por contactarnos! Te responderemos pronto.";
$error_message = "Hubo un error al enviar el mensaje. Por favor intenta nuevamente.";

// Headers para evitar problemas de CORS y seguridad
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Función para limpiar datos de entrada
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Función para validar email
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Función para validar teléfono (básica)
function validate_phone($phone) {
    return preg_match('/^[\+]?[0-9\s\-()]{10,}$/', $phone);
}

try {
    // Obtener y limpiar datos del formulario
    $name = isset($_POST['name']) ? clean_input($_POST['name']) : '';
    $email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? clean_input($_POST['phone']) : '';
    $service = isset($_POST['service']) ? clean_input($_POST['service']) : '';
    $message = isset($_POST['message']) ? clean_input($_POST['message']) : '';
    
    // Array para almacenar errores
    $errors = [];
    
    // Validaciones
    if (empty($name) || strlen($name) < 2) {
        $errors[] = "El nombre debe tener al menos 2 caracteres";
    }
    
    if (empty($email) || !validate_email($email)) {
        $errors[] = "Por favor ingresa un email válido";
    }
    
    if (!empty($phone) && !validate_phone($phone)) {
        $errors[] = "Por favor ingresa un teléfono válido";
    }
    
    if (empty($message) || strlen($message) < 10) {
        $errors[] = "El mensaje debe tener al menos 10 caracteres";
    }
    
    // Si hay errores, devolverlos
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => implode('\n', $errors)
        ]);
        exit;
    }
    
    // Mapear servicios para el email
    $services_map = [
        'limpieza' => 'Limpieza Dental',
        'blanqueamiento' => 'Blanqueamiento',
        'ortodoncia' => 'Ortodoncia',
        'implantes' => 'Implantes Dentales',
        'endodoncia' => 'Endodoncia',
        'cirugia' => 'Cirugía Oral',
        'otro' => 'Otro'
    ];
    
    $service_name = isset($services_map[$service]) ? $services_map[$service] : 'No especificado';
    
    // Preparar el email
    $subject = $subject_prefix . "Nueva consulta de " . $name;
    
    $email_body = "
    <html>
    <head>
        <title>Nueva consulta - Golden Clínica Dental</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #B8860B; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2C3E50; }
            .value { margin-top: 5px; }
            .message-box { background-color: white; padding: 15px; border-left: 4px solid #B8860B; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Nueva Consulta - Golden Clínica Dental</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Nombre:</div>
                    <div class='value'>" . htmlspecialchars($name) . "</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>" . htmlspecialchars($email) . "</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Teléfono:</div>
                    <div class='value'>" . (empty($phone) ? 'No proporcionado' : htmlspecialchars($phone)) . "</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Servicio de interés:</div>
                    <div class='value'>" . htmlspecialchars($service_name) . "</div>
                </div>
                
                <div class='message-box'>
                    <div class='label'>Mensaje:</div>
                    <div class='value'>" . nl2br(htmlspecialchars($message)) . "</div>
                </div>
                
                <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;'>
                
                <p style='font-size: 12px; color: #666;'>
                    <strong>Información adicional:</strong><br>
                    Fecha: " . date('d/m/Y H:i:s') . "<br>
                    IP: " . $_SERVER['REMOTE_ADDR'] . "<br>
                    User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Headers del email
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $email . ' <' . $email . '>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Enviar email
    $mail_sent = mail($to_email, $subject, $email_body, implode("\r\n", $headers));
    
    if ($mail_sent) {
        // Email de confirmación al cliente (opcional)
        $client_subject = $subject_prefix . "Confirmación de recepción";
        $client_body = "
        <html>
        <head>
            <title>Confirmación - Golden Clínica Dental</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #B8860B; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>¡Gracias por contactarnos!</h2>
                </div>
                <div class='content'>
                    <p>Estimado/a <strong>" . htmlspecialchars($name) . "</strong>,</p>
                    
                    <p>Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad posible.</p>
                    
                    <p><strong>Resumen de tu consulta:</strong></p>
                    <ul>
                        <li><strong>Servicio de interés:</strong> " . htmlspecialchars($service_name) . "</li>
                        <li><strong>Fecha:</strong> " . date('d/m/Y H:i:s') . "</li>
                    </ul>
                    
                    <p>Mientras tanto, puedes contactarnos directamente:</p>
                    <ul>
                        <li><strong>Teléfono:</strong> +52 (555) 123-4567</li>
                        <li><strong>WhatsApp:</strong> +52 (555) 987-6543</li>
                        <li><strong>Email:</strong> info@goldenclinica.com</li>
                    </ul>
                    
                    <p>¡Esperamos verte pronto en Golden Clínica Dental!</p>
                    
                    <p style='margin-top: 30px;'>
                        Saludos cordiales,<br>
                        <strong>Equipo de Golden Clínica Dental</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $client_headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: Golden Clínica Dental <' . $to_email . '>',
            'Reply-To: ' . $to_email,
            'X-Mailer: PHP/' . phpversion()
        ];
        
        // Enviar confirmación al cliente
        mail($email, $client_subject, $client_body, implode("\r\n", $client_headers));
        
        // Respuesta exitosa
        echo json_encode([
            'success' => true, 
            'message' => $success_message
        ]);
    } else {
        throw new Exception('Error al enviar el email');
    }
    
} catch (Exception $e) {
    // Log del error (opcional)
    error_log("Error en contact.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $error_message
    ]);
}
?>