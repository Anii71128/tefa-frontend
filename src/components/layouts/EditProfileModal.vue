<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { Camera, X } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import UserAvatar from "./UserAvatar.vue";
import AvatarCropper from "./AvatarCropper.vue";

const open = defineModel({ default: false });
const auth = useAuthStore();

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const name = ref("");
const file = ref(null);
const cropReady = ref(false);
const removeAvatar = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const fieldErrors = ref({});
const fileInput = ref(null);
const nameInput = ref(null);
const cropper = ref(null);

const savedSrc = computed(() => (removeAvatar.value ? null : auth.user?.avatar_url ?? null));
const hasPhoto = computed(() => !!savedSrc.value);
const changed = computed(
    () => name.value.trim() !== (auth.user?.name ?? "") || !!file.value || removeAvatar.value,
);
const canSave = computed(() => !saving.value && changed.value && (!file.value || cropReady.value));

watch(open, async (isOpen) => {
    if (!isOpen) return;
    name.value = auth.user?.name ?? "";
    file.value = null;
    cropReady.value = false;
    removeAvatar.value = false;
    errorMessage.value = "";
    fieldErrors.value = {};
    await nextTick();
    nameInput.value?.focus();
});

function close() {
    if (!saving.value) open.value = false;
}

function onFileChange(event) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    if (!ALLOWED.includes(picked.type)) {
        fieldErrors.value = { avatar: ["Format foto harus JPG, PNG, atau WebP."] };
        return;
    }

    fieldErrors.value = {};
    errorMessage.value = "";
    cropReady.value = false;
    file.value = picked;
    removeAvatar.value = false;
}

function cancelPick() {
    file.value = null;
    cropReady.value = false;
    fieldErrors.value = {};
}

function removePhoto() {
    removeAvatar.value = !!auth.user?.avatar_url;
    fieldErrors.value = {};
}

async function save() {
    errorMessage.value = "";
    fieldErrors.value = {};

    const trimmed = name.value.trim();
    if (trimmed.length < 3) {
        fieldErrors.value = { name: ["Nama minimal 3 karakter."] };
        return;
    }
    if (trimmed.length > 50) {
        fieldErrors.value = { name: ["Nama maksimal 50 karakter."] };
        return;
    }

    saving.value = true;
    try {
        let avatar = null;
        if (file.value) {
            try {
                avatar = await cropper.value.crop();
            } catch {
                fieldErrors.value = { avatar: ["Foto tidak bisa diproses. Coba foto lain."] };
                return;
            }
        }

        await auth.updateProfile({ name: trimmed, avatar, removeAvatar: removeAvatar.value });
        open.value = false;
    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 422 && data?.errors) {
            fieldErrors.value = data.errors;
        } else if (status === 419) {
            errorMessage.value = "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.";
        } else if (status === 413) {
            errorMessage.value = "Ukuran file terlalu besar untuk server.";
        } else {
            console.error("Simpan profil gagal:", error);
            errorMessage.value = data?.message || "Profil gagal disimpan. Coba lagi.";
        }
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="open"
            class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-neutral-950/50 p-4"
            @mousedown.self="close">
            <div role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"
                class="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" @keydown.esc="close">
                <div class="mb-5 flex items-center justify-between">
                    <h2 id="edit-profile-title" class="text-lg font-extrabold text-neutral-900">Edit Profil</h2>
                    <button type="button" class="text-neutral-400 transition-colors hover:text-neutral-700"
                        aria-label="Tutup" @click="close">
                        <X class="size-5" />
                    </button>
                </div>

                <form class="space-y-5" novalidate @submit.prevent="save">
                    <div v-if="errorMessage" role="alert"
                        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {{ errorMessage }}
                    </div>

                    <div>
                        <div v-if="file" class="flex flex-col items-center gap-3">
                            <AvatarCropper ref="cropper" :file="file" @ready="cropReady = true"
                                @error="cropReady = false" />
                            <div class="flex items-center gap-2">
                                <button type="button" :disabled="saving"
                                    class="flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-1.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                                    @click="fileInput.click()">
                                    <Camera class="size-4" />
                                    Pilih foto lain
                                </button>
                                <button type="button" :disabled="saving"
                                    class="rounded-xl px-3 py-1.5 text-[13px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-60"
                                    @click="cancelPick">
                                    Batal pilih
                                </button>
                            </div>
                        </div>

                        <div v-else class="flex items-center gap-4">
                            <UserAvatar :name="name || auth.user?.name" :src="savedSrc" size="size-20 text-2xl" />
                            <div class="flex flex-col items-start gap-1.5">
                                <div class="flex items-center gap-2">
                                    <button type="button" :disabled="saving"
                                        class="flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-1.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                                        @click="fileInput.click()">
                                        <Camera class="size-4" />
                                        {{ hasPhoto ? "Ganti foto" : "Pilih foto" }}
                                    </button>
                                    <button v-if="hasPhoto" type="button" :disabled="saving"
                                        class="rounded-xl px-3 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                                        @click="removePhoto">
                                        Hapus
                                    </button>
                                </div>
                                <p class="text-xs text-neutral-500">JPG, PNG, atau WebP. Ukuran bebas.</p>
                            </div>
                        </div>

                        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                            @change="onFileChange" />
                        <p v-if="fieldErrors.avatar" class="mt-2 text-sm text-red-600">{{ fieldErrors.avatar[0] }}</p>
                    </div>

                    <div>
                        <label for="profile-name" class="mb-2 block text-sm font-medium text-neutral-700">Nama
                            pengguna</label>
                        <input id="profile-name" ref="nameInput" v-model="name" type="text" maxlength="50"
                            autocomplete="name" :disabled="saving" :aria-invalid="!!fieldErrors.name"
                            class="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
                        <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name[0] }}</p>
                    </div>

                    <div>
                        <label for="profile-email" class="mb-2 block text-sm font-medium text-neutral-700">Email</label>
                        <input id="profile-email" type="email" :value="auth.user?.email" disabled
                            class="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500" />
                        <p class="mt-1 text-xs text-neutral-500">Email tidak bisa diubah dari sini.</p>
                    </div>

                    <div class="flex justify-end gap-2 pt-1">
                        <button type="button" :disabled="saving"
                            class="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                            @click="close">
                            Batal
                        </button>
                        <button type="submit" :disabled="!canSave"
                            class="rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60">
                            {{ saving ? "Menyimpan..." : "Simpan" }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>