<template>
  <nav class="navbar">
    <div class="home">
      <router-link to="/" class="home">Slavka.one</router-link>
    </div>
    <div class="toggle-div">
      <button @click="toggle" class="toggle"></button>
    </div>
    <div :class="open ? 'block' : 'hidden'" class="nav-list">
      <div class="nav-left">
        <router-link v-if="loggedIn" to="/protected" class="nav-link">Messages</router-link>
      </div>
      <div>
        <template v-if="!loggedIn">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Register</router-link>
        </template>
        <router-link v-else to="/logout" class="nav-link">Logout</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'navbar',
  data() {
    return {
      open: false,
      loggedIn: false,
    };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    handleLogin(newState) {
      this.loggedIn = newState;
    },
  },
};
</script>

<style lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: #2a3659;

  .home {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-left: 10px;
    padding-right: 10px;
    color: #ebeff2;
    font-size: 30px;
  }
  .toggle-div {
    display: block;
    padding: 10px;
    .toggle {
      background-color: #0477bf;
      display: flex;
      align-items: center;
      border-radius: 5px;
      width: 24px;
      height: 24px;
    }
  }
  .nav-link {
    display: block;
    color: white;
    padding: 5px;
    font-size: 22px;
  }
  .nav-link:hover {
    background-color: #6064a6;
  }
  .nav-list {
    padding-left: 16px;
    padding-right: 16px;
    width: 100%;
    flex-grow: 1;
  }
  .block {
    display: block;
  }
  .hidden {
    display: none;
  }

  @media screen and (min-width: 600px) {
    .nav-link {
      display: inline-block;
    }
    .nav-list {
      width: auto;
      display: flex;
      align-items: center;
    }
    .toggle-div {
      display: none;
    }
    .nav-left {
      flex-grow: 1;
    }
  }
}
</style>
