// 这里是 API 接口的基础 URL，如果后端地址有变动，请在这里修改
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
    
// 封装一个基础网络请求函数
export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    ...options.headers,
  }

  // 不是 formData 时，设置 Content-Type 为 application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // 如果需要处理流式响应(SSE)，由调用方自行处理，这里仅针对普通 JSON 返回进行解析
  if (headers['Accept'] === 'text/event-stream') {
    return response
  }

  const data = await response.json().catch(() => ({}))
  
  if (!response.ok) {
    throw new Error(data.message || '网络请求失败')
  }
  return data
}
