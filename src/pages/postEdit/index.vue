<template>
  <div class="post-edit-container">
    <el-card>
      <div slot="header" class="post-edit-header">
        <h2>{{ isEdit ? '编辑帖子' : '新建帖子' }}</h2>
      </div>
      
      <el-form ref="postForm" :model="postForm" :rules="rules" label-width="100px">
        <!-- 帖子标题 -->
        <el-form-item label="帖子标题" prop="postTitle">
          <el-input v-model="postForm.postTitle" placeholder="请输入帖子标题" maxlength="100" show-word-limit />
        </el-form-item>
        
        <!-- 帖子主题 -->
        <el-form-item label="帖子主题" prop="postCategory">
          <el-select v-model="postForm.postCategory" placeholder="请选择帖子主题">
            <el-option 
              v-for="topic in topicList" 
              :key="topic.id" 
              :label="topic.name" 
              :value="topic.id" 
            />
          </el-select>
        </el-form-item>
        
        <!-- 帖子内容 -->
        <el-form-item label="帖子内容" prop="postContent">
          <el-input 
            v-model="postForm.postContent" 
            type="textarea" 
            placeholder="请输入帖子内容" 
            :rows="10" 
            maxlength="2000" 
            show-word-limit 
          />
        </el-form-item>
        
        <!-- 图片上传 -->
        <el-form-item label="帖子图片">
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="{ Authorization: $store.getters.getToken }"
            :file-list="imageFileList"
            :on-success="handleImageUploadSuccess"
            :on-error="handleImageUploadError"
            :on-remove="handleImageRemove"
            :before-upload="beforeImageUpload"
            :limit="5"
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">
              最多上传5张图片，单张图片大小不超过2MB
            </div>
          </el-upload>
        </el-form-item>
        
        <!-- 表单操作按钮 -->
        <el-form-item>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import postApi from '@/api/post/index'

export default {
  data() {
    return {
      isEdit: false, // 是否为编辑模式
      topicList: [], // 主题列表
      postForm: {
        id: null,
        postTitle: '',
        postContent: '',
        postCategory: '', // 这里保持原来的字段名，避免修改后端接口
        postPic: []
      },
      rules: {
        postTitle: [
          { required: true, message: '请输入帖子标题', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        postContent: [
          { required: true, message: '请输入帖子内容', trigger: 'blur' },
          { min: 10, max: 2000, message: '长度在 10 到 2000 个字符', trigger: 'blur' }
        ],
        postCategory: [
          { required: true, message: '请选择帖子主题', trigger: 'change' }
        ]
      },
      imageFileList: [], // 图片文件列表
      uploadUrl: '/api/file/imgup' // 上传接口地址
    }
  },
  created() {
    // 检查路由参数中是否有postId，如果有则是编辑模式
    this.isEdit = this.$route.query.postId !== undefined
    
    // 加载主题列表
    this.loadTopicList()
    
    if (this.isEdit) {
      this.loadPostInfo()
    }
  },
  methods: {
    // 加载主题列表
    loadTopicList() {
      postApi.postTopicAll().then(res => {
        this.topicList = res.data || []
      }).catch(error => {
        console.error('获取主题列表失败:', error)
        this.$message.error('获取主题列表失败，请稍后重试')
      })
    },
    
    // 加载帖子信息（编辑模式）
    async loadPostInfo() {
      try {
        const postId = parseInt(this.$route.query.postId)
        const res = await postApi.postInfo({ id: postId })
        if (res.code === 0) {
          this.postForm = res.data
          // 初始化图片列表
          if (this.postForm.postPic && this.postForm.postPic.length > 0) {
            this.imageFileList = this.postForm.postPic.map(url => ({
              name: url.split('/').pop(),
              url: url
            }))
          }
        } else {
          this.$message.error(res.msg || '获取帖子信息失败')
        }
      } catch (error) {
        console.error('获取帖子信息失败:', error)
        this.$message.error('获取帖子信息失败，请重试')
      }
    },
    
    // 图片上传前的校验
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片格式的文件')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 3
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 3MB!')
        return false
      }
      return true
    },
    
    // 处理图片上传成功
    handleImageUploadSuccess(response, file, fileList) {
      if (response.code === 0) {
        // 上传成功后，将图片名称添加到表单中
        this.imageFileList = fileList
      } else {
        this.$message.error(response.msg || '图片上传失败')
      }
    },
    
    // 处理图片上传失败
    handleImageUploadError(error, file, fileList) {
      this.$message.error('图片上传失败，请重试')
      console.error('图片上传失败:', error)
    },
    
    // 处理图片移除
    handleImageRemove(file, fileList) {
      this.imageFileList = fileList
    },
    
    // 重置表单
    resetForm() {
      this.$refs.postForm.resetFields()
      this.imageFileList = []
      if (this.isEdit) {
        this.loadPostInfo()
      }
    },
    
    // 提交表单
    submitForm() {
      this.$refs.postForm.validate(async (valid) => {
        if (valid) {
          try {
            // 准备提交数据
            const submitData = {
              ...this.postForm,
              postPic: this.imageFileList.map(file => {
                // 如果是已存在的图片，直接使用URL；如果是新上传的图片，使用返回的文件名
                return file.response ? file.response.data : file.url
              })
            }
            
            // 根据是否为编辑模式调用不同的API
            let res
            if (this.isEdit) {
              res = await postApi.postUpdate(submitData)
            } else {
              res = await postApi.postCreate(submitData)
            }
            
            if (res.code === 0) {
              this.$message.success(this.isEdit ? '帖子编辑成功' : '帖子发布成功')
              // 返回帖子列表页面
              this.$router.push('/postLayout/post')
            } else {
              this.$message.error(res.msg || (this.isEdit ? '帖子编辑失败' : '帖子发布失败'))
            }
          } catch (error) {
            console.error(this.isEdit ? '编辑帖子失败:' : '发布帖子失败:', error)
            this.$message.error(this.isEdit ? '帖子编辑失败，请重试' : '帖子发布失败，请重试')
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.post-edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
  }
}

.image-uploader {
  margin-top: 10px;
  
  .el-upload-list {
    display: flex;
    flex-wrap: wrap;
    
    .el-upload-list__item {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
}
</style>