<template>
  <VContainer fluid>
    <VRow justify="center">
      <VCol cols="12" md="8">
        <VCard id="posn-main-card" variant="outlined" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">Nuevo artículo</div>
          <VForm id="posn-main-form" ref="formRef">
            <VRow density="comfortable">
              <VCol v-if="showOrgSelect" cols="12" md="6">
                <OrganizationSelect
                  v-model="product.org_id"
                  permission="product-insert"
                  hide-one
                  variant="outlined"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  id="posn-name-tf"
                  v-model="product.name"
                  label="Nombre"
                  variant="outlined"
                  density="compact"
                  :rules="[vrules.requiredField('Nombre')]"
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField id="posn-sku-tf" v-model="product.sku" label="SKU" variant="outlined" density="compact" />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  id="posn-price-tf"
                  v-model.number="product.price"
                  label="Precio"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[vrules.requiredField('Precio'), vrules.numeric]"
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  id="posn-stock-tf"
                  v-model.number="product.stock"
                  label="Stock"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[vrules.requiredField('Stock'), vrules.numeric]"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  id="posn-description-ta"
                  v-model="product.description"
                  label="Descripción"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </VCol>
            </VRow>
          </VForm>

          <div class="d-flex justify-end">
            <VBtn id="posn-cancel-btn" variant="text" class="mr-4" @click="goBack">Cancelar</VBtn>
            <VBtn id="posn-save-btn" color="primary" :loading="saving" @click="saveProduct">Guardar</VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useVrules } from "~/composables/useVrules"

definePageMeta({
  title: "Nuevo artículo",
  icon: "mdi-point-of-sale",
  permission: "product-insert",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Product } = useRepository()
const auth = useAuthStore()
const { vrules } = useVrules()

const formRef = ref()
const saving = ref(false)
const product = ref<Record<string, unknown>>({
  org_id: null,
  name: "",
  sku: "",
  description: "",
  price: 0,
  stock: 0,
})

const orgIdsForPermission = computed(() => auth.permissionsOrg["product-insert"] ?? [])
const showOrgSelect = computed(() => orgIdsForPermission.value.length > 1)

onMounted(() => {
  route.meta.back = "/pos"
  initializeForm()
})

function initializeForm() {
  if (!product.value.org_id && !showOrgSelect.value) {
    if (orgIdsForPermission.value.length === 1) {
      product.value.org_id = orgIdsForPermission.value[0]
    }
  }
}

function goBack() {
  navigateTo("/pos")
}

async function saveProduct() {
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return

  try {
    saving.value = true
    await Product.create({
      ...product.value,
      price: Number(product.value.price || 0),
      stock: Number(product.value.stock || 0),
    })
    navigateTo("/pos")
  } catch (error) {
    console.error("Error al guardar el producto", error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped></style>
