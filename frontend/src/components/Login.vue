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
      <input type="text" placeholder="Enter username" name="name" id="name" v-model="name">
    </p>

    <p class="input-field">
      <label for="password">Password:</label>
      <br />
      <input type="password"
      placeholder="Enter password"
      name="password" id="password"
      v-model="password">
    </p>

    <p class="input-field">
      <label for="privateKey">Private Key:</label>
      <br />
      <input type="password"
      placeholder="Enter Private Key"
      name="privateKey" id="privateKey"
      v-model="privateKey">
    </p>

    <p>
      <input id="submitButton" type="submit" value="Submit">
    </p>
  </div>
</form>
  <p v-if="result">
    <b id="result-message">Succesfully Logged in</b>
  </p>
  <p v-else-if="errors.length">
    <b id="result-message">Failed to Login</b>
    <br />
    <ul>
      <li v-for="(error, index) in errors" :key="index"> {{index}}.{{ error }}</li>
    </ul>
  </p>
</div>
</template>

<script>
export default {
  name: 'input-form',
  data() {
    return {
      errors: [],
      name: null,
      password: null,
      privateKey: null,
      result: false,
    };
  },
  methods: {
    async checkForm(e) {
      try {
        const contents = {
          url: '/login', type: 'post', data: { username: this.name, password: this.password },
        };
        // call vuex action to login
        this.$store.dispatch('postLoginAsync', contents);
      } catch (serverExceptions) {
        this.result = false;
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
