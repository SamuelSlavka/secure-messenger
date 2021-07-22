<template>
<div class="user-list-container">
  <div class="nav-list">
    <div class="nav">
      <div class="nav-item">
        <a disabled><h3>Contacts</h3></a>
      </div>
      <div class="nav-item">
        <a disabled className="accountInfo">
          Your address:
          {{ address }}
        </a>
      </div>
      <div class="nav-item">
        <a disabled className="accountInfo">
          Your balance:
          {{ balance }}
        </a>
      </div>
    </div>
    <div class="nav">
      <div class="nav-item">
        <a eventKey="link-1" onClick={handleShowPK}>Show PK</a>
      </div>
      <div class="nav-item">
        <a eventKey="link-2" onClick={handlePoor}>Reqest founds</a>
      </div>
      <div class="nav-item">
        <a eventKey="link-3" onClick={handleShowCreate}>Create a new Contact</a>
      </div>
    </div>
  </div>
  <div v-if="contactsFinished" class="contact-list">
    <div v-for="contact in contactsData" :key="contact.address" class="contact-item">
      {{ contact }}
    </div>
  </div>
  <div v-for="error in errors" :key="error.data" class="contact-item">
      {{ error }}
    </div>
</div>
</template>

<script>
export default {
  name: 'userlist',
  components: {},
  computed: {
    contactsFinished() {
      if (this.$store.state.users.postContactsAsyncStatusCode !== undefined) {
        return this.$store.state.users.postContactsAsyncStatusCode === 200;
      }
      return false;
    },
    contactsData() {
      if (this.$store.state.users.postContactsAsyncData !== undefined) {
        return this.$store.state.users.postContactsAsyncData === 200;
      }
      return [];
    },
  },
  methods: {
    handleShowPK() {

    },
    handlePoor() {

    },
    handleShowCreate() {

    },
    async refreshData() {
      this.errors = [];
      try {
        this.address = this.$store.getters['auth/getAddress'];
        this.username = this.$store.getters['auth/getUsername'];

        this.$store.dispatch('auth/getUserBalance', { address: this.address });
        this.balance = this.$store.state.auth.user.balance;

        const contents = {
          url: '/contacts',
          type: 'post',
          data: { address: this.address, number: this.contactList.length },
        };
        // call vuex action to login
        this.$store.dispatch('users/postContactsAsync', contents);
      } catch (serverExceptions) {
        this.errors.push(serverExceptions);
      }
    },
  },
  data() {
    return {
      address: this.$store.getters['auth/getAddress'],
      username: this.$store.getters['auth/getUsername'],
      balance: this.$store.state.auth.user.balance,
      contactList: [],
      timer: null,
      errors: [],
    };
  },
  mounted() {
    this.refreshData();
    this.timer = setInterval(() => {
      this.refreshData();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="scss">

</style>
