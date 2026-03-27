param(
    [int]$Port = 8080
)

$Path = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "========================================="
Write-Host "로컬 호스트 서버가 실행되었습니다!"
Write-Host "브라우저를 열고 http://localhost:$Port 에 접속하세요."
Write-Host "========================================="

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        # Remove leading slash and construct path
        $relativePath = $urlPath.Substring(1)
        $fullPath = Join-Path $Path $relativePath

        if (Test-Path $fullPath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($fullPath)
            
            # Set content-length
            $response.ContentLength64 = $buffer.Length

            # Determine Content Type
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                default { $response.ContentType = "application/octet-stream" }
            }

            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $message = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $message.Length
            $response.OutputStream.Write($message, 0, $message.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
