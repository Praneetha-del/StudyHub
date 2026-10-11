package com.studyhub.dto.request;

public class ReplyQueryRequest {

    private String replyText;
    private String status; // REPLIED or RESOLVED
    private Boolean resolve = false;

    public ReplyQueryRequest() {}

    public String getReplyText() {
        return replyText;
    }

    public void setReplyText(String replyText) {
        this.replyText = replyText;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getResolve() {
        return resolve != null ? resolve : false;
    }

    public void setResolve(Boolean resolve) {
        this.resolve = resolve;
    }
}
