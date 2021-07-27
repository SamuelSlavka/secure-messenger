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
          <a id="show-pk" v-on:click="decryptPK">Show PK</a>
        </div>
        <div class="nav-item">
          <a eventKey="link-2" v-on:click="handlePoor">Reqest founds</a>
        </div>
        <div class="nav-item">
          <a eventKey="link-3" v-on:click="handleShowCreate"
            >Create a new Contact</a
          >
        </div>
      </div>
    </div>
    <div v-if="contactsFinished" class="contact-list">
      <div
        v-for="contact in contactsData"
        :key="contact.address"
        class="contact-item"
      >
        {{ contact }}
      </div>
    </div>
    <div v-for="error in errors" :key="error.data" class="contact-item">
      {{ error }}
    </div>
    <modal v-if="showPK" @close="hidePK">
      <h3 slot="header">Your privatekey:</h3>
      <p slot="body">{{ privatekey }}</p>
    </modal>
  </div>
</template>

<script>
import modal from '@/components/Modal.vue';
import { getPK } from '@/modules/generalFunc';

export default {
  name: 'userlist',
  components: {
    modal,
  },
  computed: {
    contactsFinished() {
      return (
        this.$store.state.users.getContactsActionStatusCode === 200
        && this.contactsData !== []
      );
    },
    contactsData() {
      const { data } = this.$store.state.users.getContactsActionData;
      return data.result !== undefined ? data : [];
    },
  },
  methods: {
    decryptPK() {
      this.privatekey = getPK();
      this.showPK = true;
    },

    hidePK() {
      this.privatekey = null;
      this.showPK = false;
    },

    // add founds to wallet
    handlePoor() {
      this.$store.dispatch('users/addFoundsAction', { address: this.address });
    },

    // create new contact
    handleShowCreate() {},

    // periodically refresh contacts and balance
    async refreshData() {
      this.errors = [];
      try {
        this.$store.dispatch('users/getBalanceAction', { address: this.address });
        this.balance = this.$store.getters['users/getBalance'];

        // call vuex action to login
        this.$store.dispatch(
          'users/getContactsAction',
          { address: this.address, number: this.contactList.length },
        );
      } catch (serverExceptions) {
        this.errors.push(serverExceptions);
      }
    },
  },

  data() {
    return {
      address: this.$store.getters['auth/getAddress'],
      username: this.$store.getters['auth/getUsername'],
      balance: this.$store.getters['users/getBalance'],
      contactList: [],
      timer: null,
      errors: [],
      showPK: false,
      privatekey: null,
    };
  },
  mounted() {
    this.refreshData();
    this.timer = setInterval(() => {
      this.refreshData();
    }, 10000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="scss">
</style>
