<template>
  <div class="input-body">
    <form class="input-form" @submit="submitForm">
      <div class="input-header">
        <h1>Register</h1>
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

        <p>
          <input id="submitButton" type="submit" value="Submit" />
        </p>
      </div>
      <p v-if="showFail">
        <b id="result-message-fail">Failed to register</b>
      </p>
      <p v-else-if="showSuccess">
        <b id="result-message-success">Successfully registered</b>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'register-form',
  computed: {
    showFail() {
      if (this.$store.state.postRegisterAsyncStatusCode !== undefined) {
        return this.$store.state.postRegisterAsyncStatusCode !== 200;
      }
      return false;
    },
    showSuccess() {
      if (this.$store.state.postRegisterAsyncStatusCode !== undefined) {
        return this.$store.state.postRegisterAsyncStatusCode === 200;
      }
      return false;
    },
  },
  data() {
    return {
      errors: [],
      name: '',
      password: '',
      result: false,
    };
  },
  methods: {
    async submitForm(e) {
      try {
        const contents = {
          url: '/register',
          type: 'post',
          data: { username: this.name, password: this.password },
        };
        // call vuex action to register
        this.$store.dispatch('postRegisterAsync', contents);
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
