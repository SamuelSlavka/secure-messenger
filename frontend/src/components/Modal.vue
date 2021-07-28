<template>
  <div class="modal-mask">
    <div class="modal-wrapper" >
      <div class="modal-container" >

        <div class="modal-header">
          <slot name="header">
            default header
          </slot>
        </div>

        <div class="modal-body">
          <slot name="body">
            default body
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <button class="modal-default-button" @click="$emit('close')">
              Hide
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'modal',
};
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 4em;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-container {
  word-wrap: break-word;
  width: 75%;
  margin: 0px auto;
  padding: 3em 2em;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #2A3659;;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}
@media screen and (min-width: 600px) {
  .modal-container {
      width: 40em;
  }
}
</style>
