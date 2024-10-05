<template>
  <AppPageContainer title="Posts" description="A demo page to showcase how subscriptions work">
    <div class="mb-4">
      <UButton label="Create post" color="black" size="md" @click="showModal = true" />
    </div>
    <ul
      v-if="showMessage"
      class="space-y-4 p-4 text-sm text-gray-500 bg-gray-100 dark:bg-white/10 rounded-lg mb-4"
    >
      <li>
        <div class="flex items-center justify-between">
          <p class="font-semibold">How this works</p>
          <UButton icon="i-ph-x" color="gray" @click="showMessage = false" size="xs" />
        </div>
      </li>
      <li>
        If user is on Free plan/Trial/No subscription, they will see a button to create a checkout
        link, they can create 1 post.
      </li>
      <li>If a user is on a paid plan, they can create unlimited posts.</li>
    </ul>
    <ul class="mt-4 space-y-4">
      <li v-for="post in posts" :key="post.id">
        <div class="p-4 border border-gray-200 dark:border-white/10 rounded-lg">
          <div class="flex items-center justify-between">
            <p class="font-semibold">{{ post.title }}</p>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-ph-pencil-duotone"
                variant="soft"
                size="xs"
                @click="editPost(post)"
              />
              <UButton
                icon="i-ph-trash-duotone"
                color="rose"
                variant="soft"
                size="xs"
                @click="deletePost(post.id)"
              />
            </div>
          </div>
          <div class="text-sm mt-6">
            <p>{{ post.content }}</p>
          </div>
        </div>
      </li>
    </ul>
    <UModal v-model="showModal">
      <div class="p-4">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit" size="lg">
          <UFormGroup label="Title" name="title">
            <UInput v-model="state.title" />
          </UFormGroup>
          <UFormGroup label="Content" name="content" size="lg">
            <UTextarea v-model="state.content" />
          </UFormGroup>
          <UButton
            :loading="loading"
            :disabled="loading"
            size="lg"
            block
            color="black"
            type="submit"
          >
            Create post
          </UButton>
        </UForm>
      </div>
    </UModal>
  </AppPageContainer>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

// Fetch posts
const { data: posts, refresh } = await useFetch("/api/demo/posts");

const showMessage = ref(true);
const showModal = ref(false);
const loading = ref(false);

const schema = z.object({
  title: z.string().min(1).max(50),
  content: z.string().min(1).max(100),
});

const state = reactive({
  title: undefined,
  content: undefined,
});

const currentPost = ref(null);

function editPost(post) {
  currentPost.value = post;
  state.title = post.title;
  state.content = post.content;
  showModal.value = true;
}

async function onSubmit(event) {
  try {
    loading.value = true;
    if (currentPost.value) {
      // Update post
      const updatedPost = await $fetch(`/api/demo/posts/${currentPost.value.id}`, {
        method: "PATCH",
        body: event.data,
      });
      const index = posts.value.findIndex((post) => post.id === currentPost.value.id);
      posts.value[index] = updatedPost;
      toast.success("Post updated");
    } else {
      // Create post
      const post = await $fetch("/api/demo/posts", {
        method: "POST",
        body: event.data,
      });
      posts.value.push(post);
      toast.success("Post created");
    }
    showModal.value = false;
  } catch (error) {
    if (error.data.statusCode === 403) {
      toast(error.data.statusMessage, {
        action: {
          label: "Go to billing",
          onClick: () => {
            return navigateTo("/dashboard/settings/billing");
          },
        },
      });
    } else {
      toast.error(error.data.statusMessage);
    }
  } finally {
    showModal.value = false;
    loading.value = false;
    currentPost.value = null;
  }
}

async function deletePost(postId) {
  try {
    await $fetch(`/api/demo/posts/${postId}`, {
      method: "DELETE",
    });
    posts.value = posts.value.filter((post) => post.id !== postId);
    toast.success("Post deleted");
  } catch (error) {
    toast.error("Failed to delete post");
  }
}
</script>
