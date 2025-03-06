export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 首页请求，返回 HTML 页面
        if (url.pathname === '/') {
            return new Response(htmlContent, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        // 转换请求
        if (url.pathname === '/convert' && request.method === 'POST') {
            try {
                const { htmlCode } = await request.json();

                // 检查 htmlCode 是否为空
                if (!htmlCode || typeof htmlCode !== 'string') {
                    return new Response(JSON.stringify({ error: 'Invalid HTML code provided' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // 转义 HTML 代码以确保嵌入到 Worker 代码中时安全
                const escapedHtmlCode = this.escapeHtml(htmlCode);

                // 生成 Worker 代码
                const workerCode = `export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === '/') {
            return new Response(\`${escapedHtmlCode}\`, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        return new Response('Not Found', { status: 404 });
    }
}`;

                // 返回生成的 Worker 代码
                return Response.json({ workerCode });
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Failed to process the request' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 未匹配的路径
        return new Response('Not Found', { status: 404 });
    },

    // 转义 HTML 代码，确保嵌入到 JavaScript 模板字符串中时安全
    escapeHtml(str) {
        return str
            .replace(/\\/g, '\\\\') // 转义反斜杠
            .replace(/`/g, '\\`')  // 转义反引号
            .replace(/\${/g, '\\${') // 转义模板字符串插值符号
            .replace(/'/g, "\\'")  // 转义单引号
            .replace(/"/g, '\\"')  // 转义双引号
            .replace(/\n/g, '\\n') // 转义换行符
            .replace(/\r/g, '\\r'); // 转义回车符
    }
};

// HTML 内容
const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H5转Workers工具 - 智能代码转换器</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/lib/codemirror.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/theme/material-darker.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/theme/dracula.css">
      <style>
          :root {
              --primary-color: #6366f1;
              --success-color: #16a34a;
              --danger-color: #dc2626;
              --panel-bg: #ffffff;
              --border-color: #e2e8f0;
              --text-color: #1e293b;
          }
  
          [data-theme="dark"] {
              --panel-bg: #1a1b1e;
              --border-color: #2d3035;
              --text-color: #e2e8f0;
          }
  
          body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              background-color: var(--panel-bg);
              color: var(--text-color);
              transition: background-color 0.3s, color 0.3s;
          }
  
          .split-screen {
              display: grid;
              grid-template-columns: 1fr 4px 1fr;
              height: 100vh;
              gap: 10px;
              padding: 10px;
          }
  
          .editor-panel {
              background: var(--panel-bg);
              border-radius: 12px;
              border: 1px solid var(--border-color);
              padding: 20px;
              height: calc(100vh - 40px); /* 减去上下 padding */
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
  
          .resizer {
              width: 4px;
              background: var(--border-color);
              cursor: col-resize;
              border-radius: 2px;
          }
  
          .panel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
          }
  
          .CodeMirror {
              height: calc(100% - 60px); /* 减去标题栏高度 */
              font-family: 'Fira Code', monospace;
              font-size: 14px;
              background: transparent;
              overflow: auto; /* 启用滚动条 */
          }
  
          .cm-s-material-darker {
              color: #e2e8f0;
          }
  
          .cm-s-material-darker .cm-tag {
              color: #82aaff;
          }
  
          .cm-s-material-darker .cm-attribute {
              color: #c792ea;
          }
  
          .cm-s-material-darker .cm-string {
              color: #c3e88d;
          }
  
          .cm-s-material-darker .cm-comment {
              color: #546e7a;
          }
  
          .button-group {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
          }
  
          .btn {
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              transition: all 0.2s ease;
          }
  
          .btn-primary {
              background-color: var(--primary-color);
              border-color: var(--primary-color);
          }
  
          .btn-success {
              background-color: var(--success-color);
              border-color: var(--success-color);
          }
  
          .btn-danger {
              background-color: var(--danger-color);
              border-color: var(--danger-color);
          }
  
          .btn-toggle-theme {
              background-color: transparent;
              border: 1px solid var(--border-color);
              color: var(--text-color);
          }
  
          @media (max-width: 768px) {
              .split-screen {
                  grid-template-columns: 1fr;
                  grid-template-rows: 1fr 4px 1fr;
              }
              .resizer {
                  height: 4px;
                  width: 100%;
                  cursor: row-resize;
              }
          }
      </style>
 </head>
<body data-theme="light">
<div class="split-screen">
    <div class="editor-panel left-panel">
        <div class="panel-header">
            <div class="panel-title">输入H5代码</div>
            <div class="button-group">
                <button class="btn btn-primary" onclick="convertCode()">转换代码</button>
                <button class="btn btn-toggle-theme" onclick="toggleTheme()">白天/黑夜</button>
                <button class="btn btn-danger" onclick="clearInput()">清空内容</button>
            </div>
        </div>
        <div class="code-editor">
            <textarea id="htmlInput"></textarea>
        </div>
    </div>
    
    <div class="resizer" id="resizer"></div>
    
    <div class="editor-panel right-panel">
        <div class="panel-header">
            <div class="panel-title">转结果（CloudFlare work.js）</div>
            <div class="button-group">
                <button class="btn btn-success" onclick="copyCode()">复制代码</button>
                <button class="btn btn-primary" onclick="downloadFile()">下载.js</button>
                <button class="btn btn-danger" onclick="clearOutput()">清空结果</button>
            </div>
        </div>
        <div class="code-editor">
            <textarea id="workerOutput"></textarea>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/lib/codemirror.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/mode/htmlmixed/htmlmixed.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@6.65.7/mode/javascript/javascript.min.js"></script>
<script>
    // 拖拽功能实现
    const resizer = document.getElementById('resizer');
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        if (!isResizing) return;
        const newWidth = e.clientX - leftPanel.getBoundingClientRect().left;
        const maxWidth = window.innerWidth * 0.8;
        const minWidth = 300;
        
        if (newWidth > minWidth && newWidth < maxWidth) {
            leftPanel.style.flex = \`0 0 \${newWidth}px\`;
            rightPanel.style.flex = \`0 0 calc(100% - \${newWidth + 14}px)\`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
    }

    // 编辑器初始化
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlInput'), {
        mode: 'htmlmixed',
        lineNumbers: true,
        theme: 'default',
        lineWrapping: true,
        autoRefresh: true,
        styleActiveLine: true
    });

    const workerEditor = CodeMirror.fromTextArea(document.getElementById('workerOutput'), {
        mode: 'javascript',
        lineNumbers: true,
        readOnly: false,
        theme: 'default',
        lineWrapping: true,
        styleActiveLine: true
    });

    async function convertCode() {
        const htmlCode = htmlEditor.getValue();
        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ htmlCode })
            });
            const { workerCode } = await response.json();
            workerEditor.setValue(workerCode);
        } catch (err) {
            alert('转换失败: ' + err.message);
        }
    }

    function copyCode() {
        const code = workerEditor.getValue();
        navigator.clipboard.writeText(code)
            .then(() => {
                const btn = document.querySelector('.btn-success');
                btn.textContent = '已复制！';
                setTimeout(() => btn.textContent = '复制代码', 2000);
            })
            .catch(err => console.error('复制失败:', err));
    }

    function downloadFile() {
        const code = workerEditor.getValue();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'worker-' + new Date().toISOString().slice(0,10) + '.js';
        a.click();
    }

    function clearInput() {
        htmlEditor.setValue('');
    }

    function clearOutput() {
        workerEditor.setValue('');
    }

    // 主题切换功能
    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);

        // 更新 CodeMirror 主题
        htmlEditor.setOption('theme', newTheme === 'dark' ? 'material-darker' : 'default');
        workerEditor.setOption('theme', newTheme === 'dark' ? 'material-darker' : 'default');
    }

    // 动态调整 CodeMirror 高度
    function adjustEditorHeight() {
        const panelHeight = document.querySelector('.editor-panel').clientHeight;
        const headerHeight = document.querySelector('.panel-header').clientHeight;
        const editorHeight = panelHeight - headerHeight - 30; // 减去 padding 和 margin
        htmlEditor.setSize(null, editorHeight);
        workerEditor.setSize(null, editorHeight);
    }

    window.addEventListener('resize', adjustEditorHeight);
    adjustEditorHeight(); // 初始化高度
</script>
</body>
</html>`;