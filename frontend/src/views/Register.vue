<template>
<div class="input-body">
<form class="input-form" @submit="checkForm">
  <div class="input-header">
    <h1>Register</h1>
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

    <p>
      <input id="submitButton" type="submit" value="Submit">
    </p>
  </div>
</form>
  <p v-if="result">
    <b id="result-message">Succesfully Registred</b>
  </p>
  <p v-else-if="errors.length">
    <b id="result-message">Failed to Register</b>
    <br />
    <ul>
      <li v-for="(error, index) in errors" :key="error"> {{index}}.{{ error }}</li>
    </ul>
  </p>
</div>
</template>

<script>

export default {
  name: 'input-form',
  authProvider: null,
  created() {
    this.authProvider = this.app.resolve('authProvider');
  },
  data() {
    return {
      errors: [],
      name: null,
      password: null,
      result: false,
    };
  },
  methods: {
    async checkForm(e) {
      try {
        this.result = await this.authProvider.login(this.name, this.password);
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
