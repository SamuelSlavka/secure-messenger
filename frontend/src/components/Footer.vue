<template>
  <div class="footerComponent">
    <p>Welcome to slavka.one</p>
    <a id="git-link" href="https://github.com/SamuelSlavka/slavkaone">
      github.com/slavkaone
    </a>
  </div>
</template>

<script>
export default {
  name: 'footerComponent',
};
</script>

<style lang="scss">
.footerComponent {
  flex-shrink: 0;
  display: flex;
  text-align: center;
  background-color: #2a3659;
  color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;

  #git-link,
  #git-link:hover,
  #git-link:active,
  #git-link:visited {
    display: block;
    flex: 1;
    margin: 10px;
    color: white;
  }
  p {
    flex: 1;
    margin: 10px;
  }
}

</style>
