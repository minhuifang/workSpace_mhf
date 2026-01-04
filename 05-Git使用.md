# Git 使用

> Git 常用操作、提交管理、冲突解决等实用技巧

## 目录

- [提交管理](#提交管理)
- [冲突解决](#冲突解决)

---

## 提交管理

### Git 使用方法

#### 撤销提交

**1. 撤销最近一次提交（保留修改）**


git reset --soft HEAD~1
# 代码还在暂存区，只是撤销了 commit


**2. 撤销最近一次提交（不保留修改）**


git reset --hard HEAD~1
# 代码和 commit 都撤销，慎用！


**3. 修改最近一次提交**


git commit --amend
# 修改最后一次提交的内容或信息


**4. 撤销已 push 的提交**


git revert <commit-id>
# 创建一个新提交来撤销之前的提交（推荐）


---

## 冲突解决

### 解决代码冲突

#### 步骤：

**1. 拉取最新代码**


git pull origin main
# 或
git fetch origin
git merge origin/main


**2. 查看冲突文件**


git status
# 显示有冲突的文件


**3. 手动解决冲突**


// 冲突文件会显示：
<<<<<<< HEAD
你的代码
=======
别人的代码
>>>>>>> branch-name

// 手动选择保留哪部分，删除冲突标记


**4. 标记为已解决**


git add <冲突文件>


**5. 提交合并**


git commit -m "解决冲突"
git push


#### 预防冲突

- 提交前先 `git pull`
- 经常同步主分支
- 小步提交，避免大改动
- 使用 `git rebase` 保持线性历史

---

## Git 常用命令

### 基础操作


# 初始化仓库
git init

# 克隆仓库
git clone <url>

# 查看状态
git status

# 添加文件到暂存区
git add <file>
git add .  # 添加所有文件

# 提交
git commit -m "commit message"

# 推送
git push origin <branch>

# 拉取
git pull origin <branch>


### 分支操作


# 查看分支
git branch

# 创建分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换分支
git checkout -b <branch-name>

# 合并分支
git merge <branch-name>

# 删除分支
git branch -d <branch-name>

# 删除远程分支
git push origin --delete <branch-name>


### 查看历史


# 查看提交历史
git log

# 查看简洁历史
git log --oneline

# 查看图形化历史
git log --graph --oneline --all

# 查看某个文件的历史
git log <file>

# 查看某次提交的详细信息
git show <commit-id>


### 撤销操作


# 撤销工作区的修改
git checkout -- <file>

# 撤销暂存区的修改
git reset HEAD <file>

# 撤销最近一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最近一次提交（不保留修改）
git reset --hard HEAD~1

# 撤销已 push 的提交
git revert <commit-id>


### 暂存操作


# 暂存当前修改
git stash

# 查看暂存列表
git stash list

# 恢复最近的暂存
git stash pop

# 恢复指定的暂存
git stash apply stash@{0}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear


### 标签操作


# 查看标签
git tag

# 创建标签
git tag <tag-name>

# 创建带注释的标签
git tag -a <tag-name> -m "message"

# 推送标签
git push origin <tag-name>

# 推送所有标签
git push origin --tags

# 删除标签
git tag -d <tag-name>

# 删除远程标签
git push origin --delete <tag-name>


---

## Git 最佳实践

### 提交规范

**Commit Message 格式:**


<type>(<scope>): <subject>

<body>

<footer>


**Type 类型:**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档修改
- `style`: 代码格式修改
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**


git commit -m "feat(user): 添加用户登录功能"
git commit -m "fix(api): 修复接口返回数据错误"
git commit -m "docs(readme): 更新安装说明"


### 分支管理

**常用分支:**
- `main/master`: 主分支，生产环境代码
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支
- `release/*`: 发布分支

**工作流程:**


# 1. 从 develop 创建功能分支
git checkout develop
git checkout -b feature/user-login

# 2. 开发功能
git add .
git commit -m "feat: 添加用户登录功能"

# 3. 合并到 develop
git checkout develop
git merge feature/user-login

# 4. 删除功能分支
git branch -d feature/user-login


### 常见问题

**问题1: 忘记切换分支就开始开发**


# 暂存当前修改
git stash

# 切换到正确的分支
git checkout <correct-branch>

# 恢复修改
git stash pop


**问题2: 提交到错误的分支**


# 撤销提交（保留修改）
git reset --soft HEAD~1

# 切换到正确的分支
git checkout <correct-branch>

# 重新提交
git add .
git commit -m "commit message"


**问题3: 需要修改最近的提交信息**


# 修改最近一次提交
git commit --amend -m "new message"

# 如果已经 push，需要强制推送
git push --force


---

## 总结

**Git 核心操作:**
1. **基础操作**：add、commit、push、pull
2. **分支管理**：branch、checkout、merge
3. **撤销操作**：reset、revert、checkout
4. **冲突解决**：手动修改、add、commit
5. **暂存操作**：stash、pop、apply

**记忆技巧:**
- reset：撤销本地提交
- revert：撤销已推送的提交
- stash：临时保存修改
- merge：合并分支
- rebase：变基（保持线性历史）
