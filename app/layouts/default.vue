<template>
  <VApp>
    <VNavigationDrawer
      id="lay-nav-drawer"
      v-model="drawer"
      app
      temporary
      touchless
    >
      <VList id="lay-nav-list">
        <VListItem>
          <VListItemTitle>Latiabetina</VListItemTitle>
        </VListItem>
        <ClientOnly>
          <template v-for="(item, i) in items" :key="i">
            <VListGroup
              v-if="item.children"
              :value="`group-${i}`"
              :prepend-icon="item.icon"
            >
              <template #activator="{ props }">
                <VListItem v-bind="props">
                  <VListItemTitle>{{ item.title }} </VListItemTitle>
                </VListItem>
              </template>
              <VListItem
                v-for="(child, j) in item.children"
                :id="`lay-nav-child-${i}-${j}`"
                :key="`child-${i}-${j}`"
                exact
                router
                :to="child.to"
                @click="drawer = false"
              >
                <template #prepend>
                  <VIcon size="small">{{
                    child.icon || "mdi-circle-small"
                  }}</VIcon>
                </template>
                <VListItemTitle>{{ child.title }}</VListItemTitle>
              </VListItem>
            </VListGroup>
            <VListItem
              v-else
              :id="`lay-nav-item-${i}`"
              exact
              router
              :to="item.to"
              :prepend-icon="item.icon"
              @click="drawer = false"
            >
              <VListItemTitle>{{ item.title }}</VListItemTitle>
            </VListItem>
          </template>
        </ClientOnly>
        <ClientOnly>
          <template v-if="auth.loggedIn">
            <VDivider />
            <VListItem
              id="lay-nav-profile"
              to="/account"
              prepend-icon="mdi-account"
              @click="drawer = false"
            >
              <VListItemTitle>Mi Perfil</VListItemTitle>
            </VListItem>
            <VListItem
              id="lay-nav-logout"
              to="/logout"
              prepend-icon="mdi-logout"
              @click="drawer = false"
            >
              <VListItemTitle>Cerrar Sesión</VListItemTitle>
            </VListItem>
          </template>
        </ClientOnly>
      </VList>
    </VNavigationDrawer>

    <VAppBar id="lay-app-bar" app fixed elevation="2">
      <VAppBarNavIcon
        v-if="showDrawer"
        id="lay-nav-icon"
        @click.stop="drawer = !drawer"
      />
      <VBtn
        v-if="backRoute"
        id="lay-back-btn"
        icon
        class="mx-1"
        size="small"
        rounded="circle"
        variant="outlined"
        @click="handleBack"
      >
        <VIcon size="x-large">mdi-arrow-left</VIcon>
      </VBtn>
      <VIcon v-if="icon" class="mr-0">{{ icon }}</VIcon>
      <VToolbarTitle
        id="lay-title"
        class="mx-1 px-0 text-truncate"
        style="flex: 1 1 0%; min-width: 0"
        >{{ title }}</VToolbarTitle
      >
      <ClientOnly>
        <VBtn
          v-if="!auth.loggedIn && showLogin"
          id="lay-login-btn"
          icon
          @click="gotoLogin"
        >
          <VIcon>mdi-lock</VIcon>
        </VBtn>
      </ClientOnly>
      <ClientOnly>
        <VMenu
          v-if="auth.loggedIn"
          id="lay-account-menu"
          v-model="menu"
          offset-y
        >
          <template #activator="{ props }">
            <VBtn
              id="lay-account-btn"
              icon
              class="mr-3"
              color="blue"
              size="small"
              variant="flat"
              v-bind="props"
            >
              <VIcon color="white">mdi-account</VIcon>
            </VBtn>
          </template>
          <VList id="lay-account-list">
            <VListItem id="lay-account-profile" to="/account">
              <VListItemTitle>{{ userName }}</VListItemTitle>
              <VListItemSubtitle>{{ userEmail }}</VListItemSubtitle>
            </VListItem>
            <VDivider />
            <VListItem id="lay-account-logout" @click="handleLogout">
              <VListItemTitle>
                <VIcon>mdi-logout</VIcon>
                Cerrar Sesión
              </VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </ClientOnly>
    </VAppBar>

    <VMain>
      <VProgressLinear
        v-if="isLoading"
        id="lay-progress"
        indeterminate
        color="primary"
        class="global-progress"
        style="position: fixed; top: 0; left: 0; right: 0; z-index: 2000"
      />
      <slot />

      <div id="lay-snackbar-wrapper" class="snackbar-wrapper">
        <VSnackbar
          v-for="(snack, i) in notify.snacks"
          :key="snack.id"
          model-value
          :timeout="-1"
          :color="snack.color"
          location="bottom end"
          content-class="snack-content"
          :style="{ bottom: `${i * 69}px` }"
        >
          <span class="text-subtitle-1 font-weight-bold">{{ snack.text }}</span>
          <template #actions>
            <VBtn
              :id="`lay-snack-close-${snack.id}`"
              icon
              color="grey"
              size="small"
              @click="notify.closeSnackbar(snack.id)"
            >
              <VIcon>mdi-close</VIcon>
            </VBtn>
          </template>
        </VSnackbar>
      </div>
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
import { MenuService } from "~/services/menu-service";

const route = useRoute();
const drawer = ref(false);
const menu = ref(false);
const showLogin = ref(true);

const { isLoading, endNavigation } = useGlobalProgress();

onNuxtReady(() => {
  endNavigation();
});

const auth = useAuthStore();
const notify = useNotifyStore();
const title = computed(() => (route.meta?.title as string) || "Latiabetina");
const showDrawer = computed(() => route.meta?.showDrawer ?? true);
const backRoute = computed(() => route.meta?.back as string | undefined);
const icon = computed(() => route.meta?.icon as string | undefined);
const userName = computed(() => {
  const u = auth.user;
  if (!u) return "";
  return `${u.name || ""} ${u.last_name || ""}`.trim() || "Usuario";
});
const userEmail = computed(() => auth.user?.email || "");

const items = computed(() => {
  const menuService = new MenuService(auth.loggedIn, (perm) =>
    auth.hasPermission(perm),
  );
  return menuService.getMenu();
});

function gotoLogin() {
  navigateTo("/login");
}

function handleLogout() {
  menu.value = false;
  navigateTo("/logout");
}

function handleBack() {
  if (backRoute.value) {
    navigateTo(backRoute.value);
  }
}
</script>
