🟦 一、整体结构（Vue + Vite 示例）
src/
├─ main.js
├─ App.vue
└─ components/
└─ GoogleLogin.vue

🟦 二、步骤 1：在 index.html 中引入 Google SDK（必须）

在 public/index.html（或 index.html）加入：

<script src="https://accounts.google.com/gsi/client" async defer></script>

这行代码加载 Google 登录 JS SDK。

🟦 三、步骤 2：新建一个 Vue 登录组件（推荐）

创建：

src/components/GoogleLogin.vue

<template>
  <div>
    <!-- Google 的按钮容器 -->
    <div id="g_id_onload"
      :data-client_id="clientId"
      data-callback="handleCredentialResponse"
      data-auto_prompt="false">
    </div>

    <div class="g_id_signin"
      data-type="standard"
      data-size="large">
    </div>

  </div>
</template>

<script>
export default {
  name: "GoogleLogin",
  data() {
    return {
      clientId: "YOUR_GOOGLE_CLIENT_ID", // 可以公开
    };
  },

  mounted() {
    // 把回调函数挂载到 window（Google SDK 会调用它）
    window.handleCredentialResponse = this.handleCredentialResponse;
  },

  methods: {
    async handleCredentialResponse(response) {
      const credential = response.credential;

      // 将 Google 返回的 credential（ID Token）发给后台
      const res = await fetch("http://localhost:8080/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      // 保存自己的 JWT（后端生成的）
      localStorage.setItem("token", data.token);

      alert("登录成功！");
    },
  },
};
</script>

🟦 四、步骤 3：在页面中使用该组件

在 App.vue：

<template>
  <div>
    <h1>Google Login Example</h1>
    <GoogleLogin />
  </div>
</template>

<script>
import GoogleLogin from "./components/GoogleLogin.vue";

export default {
  components: { GoogleLogin },
};
</script>
