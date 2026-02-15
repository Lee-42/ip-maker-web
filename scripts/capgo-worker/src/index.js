export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 允许跨域 (CORS)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. 获取版本信息接口: /version.json
      if (path === '/version.json') {
        const object = await env.BUILD_BUCKET.get('version.json');

        if (object === null) {
          return new Response('Version info not found', { status: 404, headers: corsHeaders });
        }

        const versionData = await object.json();

        versionData.download_url = `${url.origin}/updates/${versionData.filename}`;

        return new Response(JSON.stringify(versionData), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        });
      }

      // 2. 下载更新包接口: /updates/xxx.zip
      if (path.startsWith('/updates/')) {
        const filename = path.replace('/updates/', '');
        // 安全检查：防止目录遍历
        if (filename.includes('..') || filename.includes('/')) {
           return new Response('Invalid filename', { status: 400, headers: corsHeaders });
        }

        const object = await env.BUILD_BUCKET.get(filename);

        if (object === null) {
          return new Response('File not found', { status: 404, headers: corsHeaders });
        }

        const headers = new Headers(object.httpMetadata);
        headers.set('etag', object.httpEtag);

        // 如果 R2 没有返回 Content-Type，手动设置为 zip (虽然 R2 通常会根据扩展名推断)
        if (!headers.has('content-type') && filename.endsWith('.zip')) {
          headers.set('content-type', 'application/zip');
        }

        // 加上 CORS 头
        Object.keys(corsHeaders).forEach(key => { headers.set(key, corsHeaders[key] ) });

        return new Response(object.body, {
          headers,
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (e) {
      return new Response(`Internal Error: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  },
};
