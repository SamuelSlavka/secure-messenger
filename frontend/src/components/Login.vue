<template>
  <div class="input-body">
    <form class="input-form" @submit="checkForm" action="/" method="post">
      <div class="input-header">
        <h1>Login</h1>
      </div>
      <div class="input-border">
        <p class="input-field">
          <label for="name">Username:</label>
          <br />
          <input
            type="text"
            placeholder="Enter username"
            name="name"
            id="name"
            v-model="name"
          />
        </p>

        <p class="input-field">
          <label for="password">Password:</label>
          <br />
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            id="password"
            v-model="password"
          />
        </p>

        <p class="input-field">
          <label for="privateKey">Private Key:</label>
          <br />
          <input
            type="password"
            placeholder="Enter Private Key"
            name="privateKey"
            id="privateKey"
            v-model="privateKey"
          />
        </p>

        <p>
          <input id="submitButton" type="submit" value="Submit" />
        </p>
      </div>
      <p v-if="!showResult">
        <b id="result-message-fail">Failed to login</b>
      </p>
      <p v-else-if="showResult">
        <b id="result-message-success">Successfully logged in</b>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'login-form',
  computed: {
    showResult() {
      return this.$store.state.auth.loggedin;
    },
  },
  data() {
    return {
      errors: [],
      name: '',
      password: '',
      privateKey: '',
      result: false,
    };
  },
  methods: {
    async checkForm(e) {
      try {
        const contents = {
          url: '/login',
          type: 'post',
          data: { username: this.name, password: this.password, privatekey: this.privateKey },
        };
        // call vuex action to login
        this.$store.dispatch('auth/postLoginAsync', contents);
      } catch (serverExceptions) {
        this.errors.push(serverExceptions);
      }
      e.preventDefault();
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/inputForm.scss";
</style>
