<template>
  <div id="app">
    <navbar />
    <router-view />
    <footerComponent />
  </div>
</template>

<script>
import navbar from '@/components/Navbar.vue';
import footerComponent from '@/components/Footer.vue';

export default {
  name: 'app',
  components: {
    navbar,
    footerComponent,
  },
};
</script>

<style lang="scss">
#app {
  background-color: #f2f2f2;
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: auto;
}
</style>
